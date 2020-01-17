/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Internal.Calls
{
    using Plexus.Channels;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using Plexus.Processes;
    using System;
    using System.Threading.Tasks;

    internal sealed class DuplexStreamingMethodCall<TRequest, TResponse> : 
        ProcessBase, IDuplexStreamingMethodCall<TRequest, TResponse>
    {
        private readonly IChannel<TRequest> _requestStream = new BufferedChannel<TRequest>(1);
        private readonly IChannel<TResponse> _responseStream = new BufferedChannel<TResponse>(1);
        private readonly Func<ContextLinkageOptions, ValueTask<IOutcomingInvocation<TRequest, TResponse>>> _invocationFactory;
        private readonly ContextLinkageOptions _contextLinkageOptions;

        public DuplexStreamingMethodCall(Func<ContextLinkageOptions, ValueTask<IOutcomingInvocation<TRequest, TResponse>>> invocationFactory, ContextLinkageOptions contextLinkageOptions = default)
        {
            _invocationFactory = invocationFactory;
            _contextLinkageOptions = contextLinkageOptions;
            Completion.LogCompletion(Log);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<DuplexStreamingMethodCall<TRequest, TResponse>>();

        public IReadableChannel<TResponse> ResponseStream => _responseStream.In;

        public ITerminatableWritableChannel<TRequest> RequestStream => _requestStream.Out;

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Trace("Creating invocation");
            var invocation = await _invocationFactory(_contextLinkageOptions).ConfigureAwait(false);
            OnStop(() => invocation.Out.TryTerminate());
            await invocation.StartCompletion.ConfigureAwait(false);            
            var processRequestsAsync = ProcessRequestsAsync(invocation);
            var processResponseAsync = ProcessResponsesAsync(invocation);
            _requestStream.Out.PropagateCompletionFrom(processRequestsAsync);
            _responseStream.Out.PropagateCompletionFrom(processResponseAsync);
            return Task
                .WhenAll(processRequestsAsync, processResponseAsync)
                .IgnoreExceptions()
                .ContinueWithSynchronously(_ => invocation.Completion);
        }

        public void Cancel()
        {
            Stop();
        }

        public Task CancelAsync()
        {
            return StopAsync();
        }

        private async Task ProcessResponsesAsync(IInvocation<TRequest, TResponse> invocation)
        {
            try
            {
                Log.Trace("Reading responses");
                await invocation.In
                    .ConsumeAsync(item => _responseStream.Out.WriteAsync(item, CancellationToken), CancellationToken)
                    .ConfigureAwait(false);
                Log.Trace("Responses stream completed");
            }
            catch (Exception ex)
            {
                invocation.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                Log.Trace("Awaiting response invocation completion");
                await invocation.In.Completion.ConfigureAwait(false);
            }
        }

        private async Task ProcessRequestsAsync(IInvocation<TRequest, TResponse> invocation)
        {
            try
            {
                Log.Trace("Writing requests");
                await _requestStream.In
                    .ConsumeAsync(item => invocation.Out.WriteAsync(item, CancellationToken), CancellationToken)
                    .ConfigureAwait(false);
                invocation.Out.TryComplete();
                await _requestStream.Out.Completion.ConfigureAwait(false);
                Log.Trace("Requests stream completed");
            }
            catch (Exception ex)
            {
                Log.Trace("Requests stream completed with exception: {0}", ex.FormatTypeAndMessage());
                invocation.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                Log.Trace("Awaiting request invocation completion");
                await invocation.Out.Completion.ConfigureAwait(false);
            }
        }

        IDuplexStreamingMethodCall<TRequest, TResponse> IContextAwareMethodCall<IDuplexStreamingMethodCall<TRequest, TResponse>>.WithCurrentContext()
        {
            return new DuplexStreamingMethodCall<TRequest, TResponse>(_invocationFactory, ContextLinkageOptions.WithCurrentContext());
        }
    }
}
