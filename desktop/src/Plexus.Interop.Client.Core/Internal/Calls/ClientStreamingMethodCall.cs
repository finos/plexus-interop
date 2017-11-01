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
namespace Plexus.Interop.Internal.Calls
{
    using Plexus.Channels;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using Plexus.Processes;
    using System;
    using System.Threading.Tasks;

    internal sealed class ClientStreamingMethodCall<TRequest, TResponse> : 
        ProcessBase, IClientStreamingMethodCall<TRequest, TResponse>
    {
        private readonly IChannel<TRequest> _requestStream = new BufferedChannel<TRequest>(1);
        private readonly Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> _invocationFactory;
        private readonly Promise<TResponse> _responseCompletion = new Promise<TResponse>();

        public ClientStreamingMethodCall(Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> invocationFactory)
        {
            _invocationFactory = invocationFactory;
            Completion.LogCompletion(Log);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<ClientStreamingMethodCall<TRequest, TResponse>>();

        public ITerminatableWritableChannel<TRequest> RequestStream => _requestStream.Out;

        public Task<TResponse> ResponseAsync => _responseCompletion.Task;

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Trace("Creating invocation");
            var invocation = await _invocationFactory().ConfigureAwait(false);
            OnStop(() => invocation.Out.TryTerminate());
            await invocation.StartCompletion.ConfigureAwait(false);
            var processRequestsAsync = TaskRunner.RunInBackground(() => ProcessRequestsAsync(invocation));
            var processResponseAsync = TaskRunner.RunInBackground(() => ProcessResponseAsync(invocation));
            _responseCompletion.PropagateCompletionFrom(processResponseAsync);
            _requestStream.Out.PropagateCompletionFrom(invocation.Completion);
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

        private async Task<TResponse> ProcessResponseAsync(IInvocation<TRequest, TResponse> invocation)
        {
            try
            {
                TResponse response = default;
                Log.Trace("Reading response");
                await invocation.In.ConsumeAsync(item => response = item).ConfigureAwait(false);
                Log.Trace("Response stream completed");
                return response;
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
                await _requestStream.In.ConsumeAsync(item => invocation.Out.WriteAsync(item)).ConfigureAwait(false);
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
    }
}
