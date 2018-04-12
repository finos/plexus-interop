/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Protocol.Internal.Discovery
{
    using Plexus.Interop.Protocol.Discovery;
    using Plexus.Pools;
    using System.Collections.Generic;

    internal sealed class ServiceDiscoveryResponse : PooledObject<ServiceDiscoveryResponse>, IServiceDiscoveryResponse
    {
        public IReadOnlyCollection<IDiscoveredService> Services { get; set; }

        protected override void Cleanup()
        {
            Services = default;
        }

        public override string ToString()
        {
            return $"Type: {typeof(ServiceDiscoveryResponse).Name}, {nameof(Services)}: {Services}";
        }

        public override bool Equals(object obj)
        {
            return obj is ServiceDiscoveryResponse response &&
                   EqualityComparer<IReadOnlyCollection<IDiscoveredService>>.Default.Equals(Services, response.Services);
        }

        public override int GetHashCode()
        {
            return -1198123260 + EqualityComparer<IReadOnlyCollection<IDiscoveredService>>.Default.GetHashCode(Services);
        }        
    }
}
