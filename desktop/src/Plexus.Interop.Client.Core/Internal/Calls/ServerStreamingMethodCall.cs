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

    internal sealed class ServerStreamingMethodCall<TRequest, TResponse> 
        : ProcessBase, IServerStreamingMethodCall<TResponse>
    {        
        private readonly BufferedChannel<TResponse> _responseStream = new BufferedChannel<TResponse>(1);
        private readonly CancellationTokenSource _cancellation = new CancellationTokenSource();
        private readonly Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> _invocationFactory;

        public ServerStreamingMethodCall(Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> invocationFactory)
        {
            Completion.LogCompletion(Log);
            _invocationFactory = invocationFactory;
            _responseStream.PropagateCompletionFrom(Completion);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<ServerStreamingMethodCall<TRequest, TResponse>>();

        public IReadOnlyChannel<TResponse> ResponseStream => _responseStream;

        public Task CancelAsync()
        {
            _cancellation.Cancel();
            return Completion.IgnoreExceptions();
        }

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Trace("Creating invocation");
            var invocation = await _invocationFactory().ConfigureAwait(false);
            await invocation.StartCompletion.ConfigureAwait(false);
            return ProcessAsync(invocation);
        }

        private async Task ProcessAsync(IInvocation<TRequest, TResponse> invocation)
        {
            _cancellation.Token.ThrowIfCancellationRequested();
            using (_cancellation.Token.Register(() => invocation.Out.TryTerminateWriting()))
            {
                try
                {
                    Log.Trace("Reading responses");
                    await invocation.In
                        .ConsumeAsync(item => _responseStream.Out.WriteAsync(item))
                        .ConfigureAwait(false);
                    await invocation.In.Completion.ConfigureAwait(false);
                    _responseStream.Out.TryCompleteWriting();
                }
                catch (Exception ex)
                {
                    invocation.Out.TryTerminateWriting(ex);
                    _responseStream.Out.TryTerminateWriting(ex);
                    throw;
                }
                finally
                {
                    Log.Trace("Awaiting invocation completion");
                    await invocation.Completion.ConfigureAwait(false);
                }
            }
        }
    }
}
