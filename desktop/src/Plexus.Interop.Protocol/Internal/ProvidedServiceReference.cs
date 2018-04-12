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
﻿namespace Plexus.Interop.Protocol.Internal
{
    using Plexus.Pools;

    internal sealed class ProvidedServiceReference : PooledObject<ProvidedServiceReference>, IProvidedServiceReference
    {
        public string ServiceId { get; set; }

        public Maybe<string> ServiceAlias { get; set; }

        public string ApplicationId { get; set; }

        public Maybe<UniqueId> ConnectionId { get; set; }

        protected override void Cleanup()
        {
            ServiceAlias = default;
            ServiceId = default;
            ApplicationId = default;
            ConnectionId = default;
        }

        public override string ToString()
        {
            return $"{nameof(ServiceId)}: {ServiceId}, {nameof(ServiceAlias)}: {ServiceAlias}, {nameof(ApplicationId)}: {ApplicationId}, {nameof(ConnectionId)}: {ConnectionId}";
        }

        private bool Equals(ProvidedServiceReference other)
        {
            return string.Equals(ServiceId, other.ServiceId) && ServiceAlias.Equals(other.ServiceAlias) && string.Equals(ApplicationId, other.ApplicationId) && ConnectionId.Equals(other.ConnectionId);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is ProvidedServiceReference && Equals((ProvidedServiceReference) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (ServiceId != null ? ServiceId.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ ServiceAlias.GetHashCode();
                hashCode = (hashCode * 397) ^ (ApplicationId != null ? ApplicationId.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ ConnectionId.GetHashCode();
                return hashCode;
            }
        }
    }
}
