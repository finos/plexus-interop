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
namespace Plexus.Interop.Broker
{
    using Plexus.Interop.Apps;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Metamodel.Json;
    using Plexus.Interop.Protocol.Protobuf;
    using Plexus.Interop.Transport;
    using Plexus.Interop.Transport.Protocol.Protobuf;
    using Plexus.Interop.Transport.Transmission.Pipes;
    using Plexus.Interop.Transport.Transmission.WebSockets.Server;
    using Plexus.Processes;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using ILogger = Plexus.ILogger;
    using LogManager = Plexus.LogManager;

    public sealed class BrokerRunner : ProcessBase
    {
        private static readonly ProtobufTransportProtocolSerializationProvider DefaultTransportSerializationProvider 
            = new ProtobufTransportProtocolSerializationProvider();

        private static readonly ProtobufProtocolSerializerFactory DefaultProtocolSerializationProvider 
            = new ProtobufProtocolSerializerFactory();

        private readonly string _workingDir;
        private readonly ServerConnectionListener _connectionListener;
        private readonly BrokerProcessor _brokerProcessor;
        private readonly IReadOnlyCollection<ITransportServer> _transportServers;
        private readonly AppLifecycleManager _connectionTracker;

        protected override ILogger Log { get; } = LogManager.GetLogger<BrokerRunner>();

        public BrokerRunner(string metadataDir = null, IRegistryProvider registryProvider = null)
        {
            _workingDir = Directory.GetCurrentDirectory();
            metadataDir = metadataDir ?? Path.Combine(_workingDir, "metadata");            
            _transportServers = new ITransportServer[]
            {
                new TransportServer(new PipeTransmissionServer(_workingDir), DefaultTransportSerializationProvider),
                new TransportServer(new WebSocketTransmissionServer(_workingDir), DefaultTransportSerializationProvider)
            };
            _connectionListener = new ServerConnectionListener(_transportServers);
            registryProvider = registryProvider ?? JsonRegistryProvider.Initialize(Path.Combine(metadataDir, "interop.json"));
            _connectionTracker = new AppLifecycleManager(metadataDir);
            _brokerProcessor = new BrokerProcessor(
                _connectionListener.In,
                registryProvider,
                DefaultProtocolSerializationProvider,
                _connectionTracker);
            OnStop(_connectionListener.Stop);
        }

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Info("Starting broker in directory {0}", _workingDir);
            await Task
                .WhenAll(
                    _connectionListener.StartAsync(),
                    _brokerProcessor.StartAsync(),
                    _connectionTracker.StartAsync())
                .ConfigureAwait(false);
            Log.Info("Broker started in directory {0}", _workingDir);
            return ProcessAsync();
        }

        private async Task ProcessAsync()
        {
            try
            {
                await _brokerProcessor.Completion.ConfigureAwait(false);
            }
            finally
            {
                await _connectionTracker.StopAsync().IgnoreExceptions();
                await Task.WhenAll(_transportServers.Select(x => x.StopAsync())).ConfigureAwait(false);
            }
        }
    }
}
