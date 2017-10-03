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
    using Plexus.Interop.Transport;
    using System;
    using System.Threading.Tasks;

    internal sealed class UnaryMethodCallHandler<TRequest, TResponse> : IMethodCallHandler
    {
        private readonly UnaryMethodHandler<TRequest, TResponse> _handler;
        private readonly IIncomingInvocationFactory _incomingInvocationFactory;

        public UnaryMethodCallHandler(
            UnaryMethodHandler<TRequest, TResponse> handler,
            IIncomingInvocationFactory incomingInvocationFactory)
        {
            _handler = handler;
            _incomingInvocationFactory = incomingInvocationFactory;
        }

        public async Task HandleAsync(IncomingInvocationDescriptor info, ITransportChannel channel)
        {
            var invocation = _incomingInvocationFactory.CreateAsync<TRequest, TResponse>(info, channel);            
            try
            {                
                await invocation.StartCompletion.ConfigureAwait(false);
                TRequest request = default;
                while (await invocation.In.WaitForNextSafeAsync().ConfigureAwait(false))
                {
                    while (invocation.In.TryReadSafe(out var item))
                    {
                        request = item;
                    }
                }
                var context = new MethodCallContext(info.Source.ApplicationId, info.Source.ConnectionId);
                var response = await _handler(request, context).ConfigureAwait(false);
                await invocation.Out.WriteAsync(response).ConfigureAwait(false);
                invocation.Out.TryComplete();
            }
            catch (Exception ex)
            {
                invocation.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                await invocation.Completion.ConfigureAwait(false);
            }
        }
    }
}
