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
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using System.Threading.Tasks;

    internal sealed class DuplexStreamingMethodCallHandler<TRequest, TResponse> : MethodCallHandlerBase<TRequest, TResponse>
    {
        private readonly DuplexStreamingMethodHandler<TRequest, TResponse> _handler;

        public DuplexStreamingMethodCallHandler(
            DuplexStreamingMethodHandler<TRequest, TResponse> handler, 
            IIncomingInvocationFactory incomingInvocationFactory) 
            : base(incomingInvocationFactory)
        {
            _handler = handler;
        }

        protected override async Task HandleCoreAsync(IIncomingInvocation<TRequest, TResponse> invocation, MethodCallContext context)
        {
            await _handler(invocation.In, invocation.Out, context).ConfigureAwait(false);
        }
    }
}
