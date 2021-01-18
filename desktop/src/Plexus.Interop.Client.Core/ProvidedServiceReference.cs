/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
    public sealed class ProvidedServiceReference
    {
        public static ProvidedServiceReference Create(string serviceId, string applicationId)
        {
            return new ProvidedServiceReference(serviceId, default, applicationId, default, default);
        }

        public static ProvidedServiceReference Create(string serviceId, string serviceAliasId, string applicationId)
        {
            return new ProvidedServiceReference(serviceId, serviceAliasId, applicationId, default, default);
        }

        public static ProvidedServiceReference CreateWithConnectionId(string serviceId, string applicationId, UniqueId connectionId)
        {
            return new ProvidedServiceReference(serviceId, default, applicationId, connectionId, default);
        }

        public static ProvidedServiceReference CreateWithAppInstanceId(string serviceId, string applicationId, UniqueId appInstanceId)
        {
            return new ProvidedServiceReference(serviceId, default, applicationId, default, appInstanceId);
        }

        public static ProvidedServiceReference CreateWithConnectionId(string serviceId, string serviceAliasId, string applicationId, UniqueId connectionId)
        {
            return new ProvidedServiceReference(serviceId, serviceAliasId, applicationId, connectionId, default);
        }

        public static ProvidedServiceReference CreateWithAppInstanceId(string serviceId, string serviceAliasId, string applicationId, UniqueId appInstanceId)
        {
            return new ProvidedServiceReference(serviceId, serviceAliasId, applicationId, default, appInstanceId);
        }

        internal ProvidedServiceReference(string serviceId,
            Maybe<string> serviceAlias,
            Maybe<string> applicationId,
            Maybe<UniqueId> connectionId, 
            Maybe<UniqueId> applicationInstanceId)
        {
            ServiceId = serviceId;
            ServiceAlias = serviceAlias;
            ApplicationId = applicationId;
            ConnectionId = connectionId;
            ApplicationInstanceId = applicationInstanceId;
        }

        public string ServiceId { get; }

        public Maybe<string> ServiceAlias { get; }

        public Maybe<string> ApplicationId { get; }

        public Maybe<UniqueId> ConnectionId { get; }

        public Maybe<UniqueId> ApplicationInstanceId { get; }

        public override string ToString()
        {
            return $"{nameof(ServiceId)}: {ServiceId}, {nameof(ServiceAlias)}: {ServiceAlias}, {nameof(ApplicationId)}: {ApplicationId}, {nameof(ApplicationInstanceId)}: {ApplicationInstanceId}, {nameof(ConnectionId)}: {ConnectionId}";
        }
    }
}