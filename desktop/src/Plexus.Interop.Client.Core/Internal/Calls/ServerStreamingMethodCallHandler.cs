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
namespace Plexus.Interop.Internal.Calls
{
    using Plexus.Channels;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using System.Threading.Tasks;

    internal sealed class ServerStreamingMethodCallHandler<TRequest, TResponse> : MethodCallHandlerBase<TRequest, TResponse>
    {
        private readonly ServerStreamingMethodHandler<TRequest, TResponse> _handler;

        public ServerStreamingMethodCallHandler(
            ServerStreamingMethodHandler<TRequest, TResponse> handler, 
            IIncomingInvocationFactory incomingInvocationFactory) 
            : base(incomingInvocationFactory)
        {
            _handler = handler;
        }

        protected override async Task HandleCoreAsync(IIncomingInvocation<TRequest, TResponse> invocation, MethodCallContext context)
        {
            TRequest request = default;
            await invocation.In.ConsumeAsync(x => request = x).ConfigureAwait(false);
            await _handler(request, invocation.Out, context).ConfigureAwait(false);
        }
    }
}
