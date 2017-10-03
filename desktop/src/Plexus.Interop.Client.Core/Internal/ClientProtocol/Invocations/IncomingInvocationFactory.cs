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
﻿namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;

    internal sealed class IncomingInvocationFactory : IIncomingInvocationFactory
    {
        private readonly IProtocolImplementation _protocol;
        private readonly IMarshallerProvider _marshaller;

        public IncomingInvocationFactory(IProtocolImplementation protocol, IMarshallerProvider marshaller)
        {
            _protocol = protocol;
            _marshaller = marshaller;
        }

        public IIncomingInvocation<TRequest, TResponse> CreateAsync<TRequest, TResponse>(IncomingInvocationDescriptor info, ITransportChannel channel)
        {
            var invocation = new IncomingInvocation<TRequest, TResponse>(
                info,
                channel,
                _protocol,                
                _marshaller.GetMarshaller<TRequest>(),
                _marshaller.GetMarshaller<TResponse>());
            invocation.Start();
            return invocation;
        }
    }
}
