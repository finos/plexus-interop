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
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Channels;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using Plexus.Processes;

    internal sealed class ClientStreamingMethodCall<TRequest, TResponse> : 
        ProcessBase, IClientStreamingMethodCall<TRequest, TResponse>
    {
        private static readonly ILogger Log = LogManager.GetLogger<ClientStreamingMethodCall<TRequest, TResponse>>();
        private readonly IChannel<TRequest> _requestStream = new BufferedChannel<TRequest>(1);
        private readonly CancellationTokenSource _cancellation = new CancellationTokenSource();
        private readonly Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> _invocationFactory;
        private readonly Promise<TResponse> _responseCompletion = new Promise<TResponse>();

        public ClientStreamingMethodCall(Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> invocationFactory)
        {
            _invocationFactory = invocationFactory;
            Completion.LogCompletion(Log);
        }

        public IWritableChannel<TRequest> RequestStream => _requestStream.Out;

        public Task<TResponse> ResponseAsync => _responseCompletion.Task;

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Trace("Creating invocation");
            var invocation = await _invocationFactory().ConfigureAwait(false);
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

        public Task CancelAsync()
        {
            _cancellation.Cancel();
            return Completion.IgnoreExceptions();
        }

        private async Task<TResponse> ProcessResponseAsync(IInvocation<TRequest, TResponse> invocation)
        {
            using (_cancellation.Token.Register(() => invocation.TryTerminate()))
            {
                try
                {
                    TResponse response = default;
                    Log.Trace("Reading response");
                    do
                    {
                        while (invocation.In.TryRead(out var item))
                        {
                            response = item;
                        }
                    } while (await invocation.In.WaitReadAvailableAsync().ConfigureAwait(false));
                    Log.Trace("Response stream completed");
                    return response;
                }
                catch (Exception ex)
                {
                    invocation.Out.TryTerminateWriting(ex);
                    throw;
                }
                finally
                {
                    Log.Trace("Awaiting response invocation completion");
                    await invocation.In.Completion.ConfigureAwait(false);
                }
            }            
        }

        private async Task ProcessRequestsAsync(IInvocation<TRequest, TResponse> invocation)
        {
            using (_cancellation.Token.Register(() => invocation.TryTerminate()))
            {
                try
                {
                    Log.Trace("Writing requests");
                    while (await _requestStream.In.WaitReadAvailableAsync().ConfigureAwait(false))
                    {
                        while (_requestStream.In.TryRead(out var item))
                        {
                            await invocation.Out.TryWriteSafeAsync(item).ConfigureAwait(false);
                        }
                    }
                    invocation.Out.TryCompleteWriting();
                    await _requestStream.Out.Completion.ConfigureAwait(false);
                    Log.Trace("Requests stream completed");
                }
                catch (Exception ex)
                {
                    Log.Trace("Requests stream completed with exception: {0}", ex.FormatTypeAndMessage());
                    invocation.Out.TryTerminateWriting(ex);
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
}
