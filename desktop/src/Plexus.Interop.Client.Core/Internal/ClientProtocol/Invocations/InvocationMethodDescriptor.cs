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
﻿namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using System.Collections.Generic;

    internal sealed class InvocationMethodDescriptor
    {
        public InvocationMethodDescriptor(
            string serviceId, 
            string methodId,
            Maybe<string> serviceAliasId = default)
        {
            ServiceId = serviceId;
            MethodId = methodId;
            ServiceAliasId = serviceAliasId;
        }

        public string ServiceId { get; }

        public string MethodId { get; }

        public Maybe<string> ServiceAliasId { get; }

        public override bool Equals(object obj)
        {
            return obj is InvocationMethodDescriptor descriptor &&
                   ServiceId == descriptor.ServiceId &&
                   MethodId == descriptor.MethodId &&
                   ServiceAliasId.Equals(descriptor.ServiceAliasId);
        }

        public override int GetHashCode()
        {
            var hashCode = 84604672;
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(ServiceId);
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(MethodId);
            hashCode = hashCode * -1521134295 + EqualityComparer<Maybe<string>>.Default.GetHashCode(ServiceAliasId);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{nameof(ServiceId)}: {ServiceId}, {nameof(MethodId)}: {MethodId}, {nameof(ServiceAliasId)}: {ServiceAliasId}";
        }
    }
}
