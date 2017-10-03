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
﻿namespace Plexus.Interop.Protocol.Internal.Invocation
{
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Pools;
    using System.Collections.Generic;

    internal sealed class InvocationStartRequested : PooledObject<InvocationStartRequested>, IInvocationStartRequested
    {
        public string ServiceId { get; set; }

        public string MethodId { get; set; }

        public Maybe<string> ServiceAlias { get; set; }

        public string ConsumerApplicationId { get; set; }

        public UniqueId ConsumerConnectionId { get; set; }        

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
            ServiceAlias = default;
        }

        public override string ToString()
        {
            return $"{{Type: {typeof(InvocationStartRequested).Name}, {nameof(ServiceId)}: {ServiceId}, {nameof(MethodId)}: {MethodId}, {nameof(ConsumerApplicationId)}: {ConsumerApplicationId}, {nameof(ConsumerConnectionId)}: {ConsumerConnectionId}, {nameof(ServiceAlias)}: {ServiceAlias}}}";
        }

        public override bool Equals(object obj)
        {
            return obj is InvocationStartRequested requested &&
                   ServiceId == requested.ServiceId &&
                   MethodId == requested.MethodId &&
                   ConsumerApplicationId == requested.ConsumerApplicationId &&
                   ConsumerConnectionId.Equals(requested.ConsumerConnectionId) &&
                   ServiceAlias.Equals(requested.ServiceAlias);
        }

        public override int GetHashCode()
        {
            var hashCode = -1849578967;
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(ServiceId);
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(MethodId);
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(ConsumerApplicationId);
            hashCode = hashCode * -1521134295 + EqualityComparer<UniqueId>.Default.GetHashCode(ConsumerConnectionId);
            hashCode = hashCode * -1521134295 + EqualityComparer<Maybe<string>>.Default.GetHashCode(ServiceAlias);
            return hashCode;
        }
    }
}
