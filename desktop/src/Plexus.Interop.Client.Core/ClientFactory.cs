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
﻿namespace Plexus.Interop
{
    using System;
    using Plexus.Interop.Internal;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;

    public sealed class ClientFactory : IClientFactory
    {
        public static readonly IClientFactory Instance = new ClientFactory();

        public IClient Create(ClientOptions options)
        {
            return new Client(options);
        }

        public IClient Create(
            string appId, 
            ITransportClient transport, 
            IProtocolImplementation protocol,
            IMarshallerProvider marshaller, 
            Func<ClientOptionsBuilder, ClientOptionsBuilder> setup = default)
        {
            var builder = new ClientOptionsBuilder()
                .WithApplicationId(appId)
                .WithMarshaller(marshaller)
                .WithProtocol(protocol)
                .WithTransport(transport);
            if (setup != default)
            {
                builder = setup(builder);
            }
            return new Client(builder.Build());
        }
    }
}