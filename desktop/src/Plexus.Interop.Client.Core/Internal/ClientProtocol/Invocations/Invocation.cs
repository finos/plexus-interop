/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
            _sender.RequestStream.PropagateCompletionFrom(_sender.Completion);
            OnStop(_sender.Stop);
            OnStop(_receiver.Stop);
        }

        protected override ILogger Log => _log;

        public UniqueId Id => _channel.Id;

        public ITerminatableWritableChannel<TRequest> Out => _sender.RequestStream;

        public void Cancel()
        {
            Stop();
        }

        public IReadableChannel<TResponse> In => _receiver.ResponseStream;

        protected abstract Task InitializeSendingAsync();

        protected abstract Task InitializeReceivingAsync();

        protected override async Task<Task> StartCoreAsync()
        {            
            try
            {
                _log.Trace("Starting processing invocation");
                await InitializeSendingAsync().ConfigureAwait(false);
                await _sender.StartAsync().ConfigureAwait(false);
                await InitializeReceivingAsync().ConfigureAwait(false);
                await _receiver.StartAsync().ConfigureAwait(false);
                return ProcessAsync();
            }
            catch (Exception ex)
            {
                _channel.Out.TryTerminate(ex);
                await _channel.In.DisposeRemainingItemsAsync().IgnoreExceptions().ConfigureAwait(false);
                await _channel.Completion.ConfigureAwait(false);
                throw;
            }
        }

        private async Task ProcessAsync()
        {
            try
            {
                _sender.RequestStream.PropagateCompletionFrom(_receiver.Completion);
                await _sender.RequestCompletion.ConfigureAwait(false);                
                _log.Trace("Requests completed");
                await _receiver.ResponseCompletion.ConfigureAwait(false);
                _log.Trace("Responses completed");
                _sender.TryComplete();
                await _sender.Completion.ConfigureAwait(false);
                _log.Trace("Sending completed");
                _channel.Out.TryComplete();
                await _receiver.Completion.ConfigureAwait(false);
                _log.Trace("Receiving completed");
            }
            catch (Exception ex)
            {
                _log.Debug("Invocation terminated because of exception: {0}", ex.FormatTypeAndMessage());
                _channel.Out.TryTerminate(ex);                
                throw;
            }
            finally
            {
                await _channel.In.DisposeRemainingItemsAsync().IgnoreExceptions().ConfigureAwait(false);
                await _channel.Completion.ConfigureAwait(false);
            }
        }
    }
}