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
﻿namespace Plexus.Interop.Protocol.Internal
{
    using Plexus.Pools;

    internal sealed class ConsumedServiceReference : PooledObject<ConsumedServiceReference>, IConsumedServiceReference
    {
        protected override void Cleanup()
        {
            ServiceId = default;
            ServiceAlias = default;
        }

        public string ServiceId { get; set; }

        public Maybe<string> ServiceAlias { get; set; }

        public override string ToString()
        {
            return $"{nameof(ServiceId)}: {ServiceId}, {nameof(ServiceAlias)}: {ServiceAlias}";
        }

        private bool Equals(ConsumedServiceReference other)
        {
            return string.Equals(ServiceId, other.ServiceId) && ServiceAlias.Equals(other.ServiceAlias);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is ConsumedServiceReference && Equals((ConsumedServiceReference) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return ((ServiceId != null ? ServiceId.GetHashCode() : 0) * 397) ^ ServiceAlias.GetHashCode();
            }
        }
    }
}
