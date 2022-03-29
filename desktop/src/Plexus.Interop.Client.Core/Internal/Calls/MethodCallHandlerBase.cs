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
    using Plexus.Interop.Transport;
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    internal abstract class MethodCallHandlerBase<TRequest, TResponse> : IMethodCallHandler
    {
        private readonly IIncomingInvocationFactory _incomingInvocationFactory;

        protected MethodCallHandlerBase(IIncomingInvocationFactory incomingInvocationFactory)
        {
            _incomingInvocationFactory = incomingInvocationFactory;
        }

        public async Task HandleAsync(IncomingInvocationDescriptor info, ITransportChannel channel)
        {
            var invocation = _incomingInvocationFactory.CreateAsync<TRequest, TResponse>(info, channel);
            var cancellation = new CancellationTokenSource();
            invocation.Completion
                .ContinueWithSynchronously(_ => cancellation.Cancel(), CancellationToken.None)
                .IgnoreAwait();
            try
            {
                await invocation.StartCompletion.ConfigureAwait(false);
                var context = new MethodCallContext(
                    info.Source.ApplicationId,
                    info.Source.ApplicationInstanceId,
                    info.Source.ConnectionId,
                    info.Source.TransportType,
                    cancellation.Token);
                await HandleCoreAsync(invocation, context).ConfigureAwait(false);
                invocation.Out.TryComplete();
            }
            catch (Exception ex)
            {
                invocation.Out.TryTerminate(ex);
                invocation.In.ConsumeBufferedItems(x => { });
                throw;
            }
            finally
            {
                await invocation.Completion.ConfigureAwait(false);
            }
        }

        protected abstract Task HandleCoreAsync(
            IIncomingInvocation<TRequest, TResponse> invocation,
            MethodCallContext context);
    }
}
