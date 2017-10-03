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
﻿using Plexus.Interop.Protocol.Discovery;
using Plexus.Interop.Protocol.Connect;
using Plexus.Interop.Protocol.Invocation;

namespace Plexus.Interop.Protocol
{
    public interface IProtocolMessageFactory : 
        IConnectProtocolMessageFactory,
        IInvocationProtocolMessageFactory,
        IDiscoveryProtocolMessageFactory
    {
        IConsumedServiceReference CreateConsumedServiceReference(
            string serviceId,
            Maybe<string> serviceAlias);

        IConsumedMethodReference CreateConsumedMethodReference(IConsumedServiceReference consumedService, string methodId);

        IProvidedServiceReference CreateProvidedServiceReference(
            string serviceId,
            Maybe<string> serviceAlias,
            string applicationId,
            Maybe<UniqueId> connectionId);

        IProvidedMethodReference CreateProvidedMethodReference(
            IProvidedServiceReference providedService,
            string methodId);
    }
}
