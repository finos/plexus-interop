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

    internal sealed class ServiceDiscoveryRequest : PooledObject<ServiceDiscoveryRequest>, IServiceDiscoveryRequest
    {
        public Maybe<IConsumedServiceReference> ConsumedService { get; set; }

        public DiscoveryMode DiscoveryMode { get; set; }

        public T Handle<T, TArgs>(ClientToBrokerRequestHandler<T, TArgs> handler, TArgs args = default)
        {
            return handler.Handle(this, args);
        }

        protected override void Cleanup()
        {
            ConsumedService.GetValueOrDefault()?.Dispose();
            ConsumedService = default;
            DiscoveryMode = default;
        }

        public override string ToString()
        {
            return $"{nameof(ConsumedService)}: {{{ConsumedService}}}, {nameof(DiscoveryMode)}: {DiscoveryMode}";
        }

        private bool Equals(ServiceDiscoveryRequest other)
        {
            return ConsumedService.Equals(other.ConsumedService) && DiscoveryMode == other.DiscoveryMode;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is ServiceDiscoveryRequest && Equals((ServiceDiscoveryRequest) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return (ConsumedService.GetHashCode() * 397) ^ (int) DiscoveryMode;
            }
        }
    }
}
