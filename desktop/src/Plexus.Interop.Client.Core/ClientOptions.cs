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
 namespace Plexus.Interop
{
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;
    using System.Collections.Generic;
    using System.Linq;

    public sealed class ClientOptions
    {
        internal ClientOptions(
            string brokerWorkingDir,
            string applicationId,
            UniqueId applicationInstanceId,
            ITransportClient transport,
            IProtocolImplementation protocol,
            IMarshallerProvider marshaller,
            IEnumerable<ProvidedServiceDefinition> services)
        {
            BrokerWorkingDir = brokerWorkingDir;
            ApplicationId = applicationId;
            ApplicationInstanceId = applicationInstanceId;
            Transport = transport;
            Marshaller = marshaller;
            Protocol = protocol;
            Services = new List<ProvidedServiceDefinition>(services);
            ServicesDictionary = Services.ToDictionary(x => x.Id, x => x);
        }

        public string BrokerWorkingDir { get; }

        public string ApplicationId { get; }

        public UniqueId ApplicationInstanceId { get; }

        public ITransportClient Transport { get; }

        public IProtocolImplementation Protocol { get; }

        public IMarshallerProvider Marshaller { get; }

        public IReadOnlyCollection<ProvidedServiceDefinition> Services { get; }

        internal IReadOnlyDictionary<string, ProvidedServiceDefinition> ServicesDictionary { get; }

        public override string ToString()
        {
            return $"{nameof(BrokerWorkingDir)}: {BrokerWorkingDir}, {nameof(ApplicationId)}: {ApplicationId}, {nameof(ApplicationInstanceId)}: {ApplicationInstanceId}, {nameof(Transport)}: {Transport}, {nameof(Protocol)}: {Protocol}, {nameof(Marshaller)}: {Marshaller}, {nameof(Services)}: {Services.FormatEnumerableObjects()}";
        }
    }
}
