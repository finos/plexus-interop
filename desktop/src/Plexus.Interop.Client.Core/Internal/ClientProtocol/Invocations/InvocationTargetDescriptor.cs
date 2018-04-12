/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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

    internal sealed class InvocationTargetDescriptor
    {
        public InvocationTargetDescriptor(
            string applicationId = default,
            Maybe<UniqueId> connectionId = default,
            Maybe<string> serviceAliasId = default)
        {
            ApplicationId = applicationId;
            ConnectionId = connectionId;
            ServiceAliasId = serviceAliasId;
        }

        public string ApplicationId { get; }

        public Maybe<UniqueId> ConnectionId { get; }

        public Maybe<string> ServiceAliasId { get; }

        public override bool Equals(object obj)
        {
            return obj is InvocationTargetDescriptor descriptor &&
                   ApplicationId.Equals(descriptor.ApplicationId) &&
                   ConnectionId.Equals(descriptor.ConnectionId) &&
                   ServiceAliasId.Equals(descriptor.ServiceAliasId);
        }

        public override int GetHashCode()
        {
            var hashCode = 60411934;
            hashCode = hashCode * -1521134295 + EqualityComparer<Maybe<string>>.Default.GetHashCode(ApplicationId);
            hashCode = hashCode * -1521134295 + EqualityComparer<Maybe<UniqueId>>.Default.GetHashCode(ConnectionId);
            hashCode = hashCode * -1521134295 + EqualityComparer<Maybe<string>>.Default.GetHashCode(ServiceAliasId);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{{{nameof(ApplicationId)}: {ApplicationId}, {nameof(ConnectionId)}: {ConnectionId}, {nameof(ServiceAliasId)}: {ServiceAliasId}}}";
        }
    }
}
