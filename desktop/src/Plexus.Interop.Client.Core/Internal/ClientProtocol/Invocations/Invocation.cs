/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;
    using Plexus.Processes;
    using System;
    using System.Threading.Tasks;

    internal abstract class Invocation<TRequest, TResponse> : ProcessBase, IInvocation<TRequest, TResponse>
    {
        private readonly ILogger _log;
        private readonly ITransportChannel _channel;
        private readonly InvocationSendProcessor<TRequest> _sender;
        private readonly InvocationReceiveProcessor<TResponse> _receiver;
        private readonly InvocationState _invocationState = new InvocationState();

        protected Invocation(
            ITransportChannel channel,
            IProtocolImplementation protocol,
            IMarshaller<TRequest> requestMarshaller,
            IMarshaller<TResponse> responseMarshaller)
        {
            _log = LogManager.GetLogger<Invocation<TRequest, TResponse>>(channel.Id.ToString());
            _channel = channel;
            _sender = new InvocationSendProcessor<TRequest>(channel.Id, channel.Out, protocol, requestMarshaller, _invocationState);
            _receiver = new InvocationReceiveProcessor<TResponse>(channel.Id, channel.In, protocol, responseMarshaller, _sender, _invocationState);
            OnStop(_sender.Stop);
            OnStop(_receiver.Stop);
        }

        protected override ILogger Log => _log;

        public UniqueId Id => _channel.Id;

        public IWritableChannel<TRequest> Out => _sender.RequestStream;

        public IReadOnlyChannel<TResponse> In => _receiver.ResponseStream;

        protected abstract Task InitializeSendingAsync();

        protected abstract Task InitializeReceivingAsync();

        protected override async Task<Task> StartCoreAsync()
        {
            _log.Trace("Starting processing invocation");
            await InitializeSendingAsync().ConfigureAwait(false);
            await _sender.StartAsync().ConfigureAwait(false);
            await InitializeReceivingAsync().ConfigureAwait(false);
            await _receiver.StartAsync().ConfigureAwait(false);
            return ProcessAsync();
        }

        private async Task ProcessAsync()
        {
            try
            {
                await Task
                    .WhenAny(_sender.RequestCompletion, _receiver.ResponseCompletion)
                    .Unwrap()
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _sender.RequestStream.TryTerminateWriting(ex);
            }
            try
            {
                await Task
                    .WhenAll(_sender.RequestCompletion, _receiver.ResponseCompletion)
                    .ConfigureAwait(false);
                _sender.TryCompleteWriting();
            }
            catch (Exception ex)
            {
                _sender.TryTerminateWriting(ex);
            }
            _log.Trace("Sending and receiving completed");
            try
            {
                await Task.WhenAll(_sender.Completion, _receiver.Completion).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _channel.Out.TryTerminateWriting(ex);
                await _channel.In.DisposeRemainingItemsAsync().IgnoreExceptions().ConfigureAwait(false);
                throw;
            }
            finally
            {
                await _channel.Completion.ConfigureAwait(false);
            }
        }
    }
}