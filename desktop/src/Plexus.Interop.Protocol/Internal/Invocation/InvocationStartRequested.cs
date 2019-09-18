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
﻿namespace Plexus.Interop.Protocol.Internal.Invocation
{
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Pools;

    internal sealed class InvocationStartRequested : PooledObject<InvocationStartRequested>, IInvocationStartRequested
    {
        public string ServiceId { get; set; }

        public string MethodId { get; set; }

        public Maybe<string> ServiceAlias { get; set; }

        public string ConsumerApplicationId { get; set; }

        public UniqueId ConsumerConnectionId { get; set; }

        public UniqueId ConsumerApplicationInstanceId { get; set; }

        public T Handle<T, TArgs>(BrokerToClientRequestHandler<T, TArgs> handler, TArgs args = default)
        {
            return handler.Handle(this, args);
        }

        protected override void Cleanup()
        {
            ServiceId = default;
            MethodId = default;
            ConsumerApplicationId = default;
            ConsumerConnectionId = default;
            ConsumerApplicationInstanceId = default;
            ServiceAlias = default;
        }

        public override string ToString()
        {
            return $"{nameof(ServiceId)}: {ServiceId}, {nameof(MethodId)}: {MethodId}, {nameof(ServiceAlias)}: {ServiceAlias}, {nameof(ConsumerApplicationId)}: {ConsumerApplicationId}, {nameof(ConsumerConnectionId)}: {ConsumerConnectionId}, {nameof(ConsumerApplicationInstanceId)}: {ConsumerApplicationInstanceId}";
        }

        private bool Equals(InvocationStartRequested other)
        {
            return string.Equals(ServiceId, other.ServiceId) && string.Equals(MethodId, other.MethodId) && ServiceAlias.Equals(other.ServiceAlias) && string.Equals(ConsumerApplicationId, other.ConsumerApplicationId) && ConsumerConnectionId.Equals(other.ConsumerConnectionId) && ConsumerApplicationInstanceId.Equals(other.ConsumerApplicationInstanceId);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is InvocationStartRequested requested && Equals(requested);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (ServiceId != null ? ServiceId.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (MethodId != null ? MethodId.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ ServiceAlias.GetHashCode();
                hashCode = (hashCode * 397) ^ (ConsumerApplicationId != null ? ConsumerApplicationId.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ ConsumerConnectionId.GetHashCode();
                hashCode = (hashCode * 397) ^ ConsumerApplicationInstanceId.GetHashCode();
                return hashCode;
            }
        }
    }
}
