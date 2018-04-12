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
namespace Plexus.Interop
{
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;

    public sealed class ClientOptionsBuilder
    {
        private static readonly ILogger Log = LogManager.GetLogger<ClientOptionsBuilder>();

        private readonly List<(string Name, Maybe<string> Alias, Func<ProvidedServiceDefinition.Builder, ProvidedServiceDefinition.Builder> Setup)> _serviceFactories
            = new List<(string, Maybe<string>, Func<ProvidedServiceDefinition.Builder, ProvidedServiceDefinition.Builder>)>();

        public string BrokerWorkingDir { get; private set; }

        public string ApplicationId { get; private set; }

        public UniqueId ApplicationInstanceId { get; private set; }

        public ITransportClient Transport { get; private set; }

        public IProtocolImplementation Protocol { get; private set; }

        public IMarshallerProvider Marshaller { get; private set; }

        public ClientOptionsBuilder WithBrokerWorkingDir(string brokerWorkingDir)
        {
            BrokerWorkingDir = brokerWorkingDir;
            return this;
        }

        public ClientOptionsBuilder WithApplicationId(string applicationId)
        {
            ApplicationId = applicationId;
            return this;
        }

        public ClientOptionsBuilder WithAppInstanceId(UniqueId instanceId)
        {
            ApplicationInstanceId = instanceId;
            return this;
        }

        public ClientOptionsBuilder WithTransport(ITransportClient transport)
        {
            Transport = transport;
            return this;
        }

        public ClientOptionsBuilder WithProtocol(IProtocolImplementation protocol)
        {
            Protocol = protocol;
            return this;
        }

        public ClientOptionsBuilder WithMarshaller(IMarshallerProvider marshallerProvider)
        {
            Marshaller = marshallerProvider;
            return this;
        }

        public ClientOptionsBuilder WithProvidedService(string name, Func<ProvidedServiceDefinition.Builder, ProvidedServiceDefinition.Builder> setup)
        {
            _serviceFactories.Add((name, default, setup));
            return this;
        }

        public ClientOptionsBuilder WithProvidedService(string name, string alias, Func<ProvidedServiceDefinition.Builder, ProvidedServiceDefinition.Builder> setup)
        {
            _serviceFactories.Add((name, alias, setup));
            return this;
        }

        public ClientOptions Build()
        {
            if (BrokerWorkingDir == null)
            {
                BrokerWorkingDir = EnvironmentHelper.GetBrokerWorkingDir();
                if (BrokerWorkingDir == null)
                {
                    throw new ArgumentException($"Broker working directory must be specified either explicitly or through environment variable {EnvironmentHelper.BrokerWorkingDirVarName}");
                }
            }
            if (string.IsNullOrEmpty(ApplicationId))
            {
                throw new ArgumentException("Application ID must be specified");
            }
            if (Transport == null)
            {
                throw new ArgumentException("Transport implementation must be specified");
            }
            if (Protocol == null)
            {
                throw new ArgumentException("Protocol implementation must be specified");
            }
            if (Marshaller == null)
            {
                throw new ArgumentException("Marshaller implementation must be specified");
            }
            if (ApplicationInstanceId == default)
            {
                try
                {
                    var instanceIdVar = EnvironmentHelper.GetAppInstanceId();
                    ApplicationInstanceId = instanceIdVar == null
                        ? UniqueId.Generate()
                        : UniqueId.FromString(instanceIdVar);
                }
                catch (Exception exception)
                {
                    Log.Warn(exception, "Exception while reading app instance id from environment variable {0}. Generating new unique id as fallback...", EnvironmentHelper.AppInstanceIdVarName);
                    ApplicationInstanceId = UniqueId.Generate();
                }
            }
            var incomingInvocationFactory = new IncomingInvocationFactory(Protocol, Marshaller);
            return new ClientOptions(
                BrokerWorkingDir,
                ApplicationId,
                ApplicationInstanceId,
                Transport,
                Protocol,
                Marshaller,
                GetServiceDefinitions());
            IEnumerable<ProvidedServiceDefinition> GetServiceDefinitions()
            {
                foreach (var serviceFactory in _serviceFactories)
                {
                    var builder = new ProvidedServiceDefinition.Builder(serviceFactory.Name, serviceFactory.Alias, incomingInvocationFactory);
                    yield return serviceFactory.Setup(builder).Build();
                }
            }
        }
    }
}
