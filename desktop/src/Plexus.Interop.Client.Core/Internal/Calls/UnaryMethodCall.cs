/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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

    internal sealed class UnaryMethodCall<TRequest, TResponse> 
        : ProcessBase, IUnaryMethodCall<TResponse>, IUnaryMethodCall
    {
        private readonly Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> _invocationFactory;
        private TResponse _response;

        public UnaryMethodCall(Func<ValueTask<IOutcomingInvocation<TRequest, TResponse>>> invocationFactory)
        {
            _invocationFactory = invocationFactory;
            Completion.LogCompletion(Log);
            ResponseAsync = Completion.ContinueWithSynchronously(t =>
            {
                t.GetResult();
                return _response;
            });
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<UnaryMethodCall<TRequest, TResponse>>();

        public Task<TResponse> ResponseAsync { get; }

        Task IUnaryMethodCall.ResponseAsync => ResponseAsync;

        public void Cancel()
        {
            Stop();
        }

        public Task CancelAsync()
        {
            return StopAsync();
        }

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Trace("Creating invocation");
            var invocation = await _invocationFactory().ConfigureAwait(false);
            OnStop(() => invocation.Out.TryTerminate());
            await invocation.StartCompletion.ConfigureAwait(false);
            return ProcessAsync(invocation);
        }

        private async Task ProcessAsync(IInvocation<TRequest, TResponse> invocation)
        {
            try
            {
                _response = default;
                Log.Trace("Reading response");
                await invocation.In.ConsumeAsync(x => _response = x, CancellationToken).ConfigureAwait(false);
                Log.Trace("Response stream completed");
            }
            catch (Exception ex)
            {
                invocation.Out.TryTerminate(ex);
                await invocation.In.ConsumeAsync(_ => { }).IgnoreExceptions().ConfigureAwait(false);
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
