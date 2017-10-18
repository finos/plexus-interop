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
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;
    using ILogger = Plexus.ILogger;
    using LogManager = Plexus.LogManager;

    public sealed class BrokerRunner : ProcessBase
    {
        private static readonly ILogger Log = LogManager.GetLogger<BrokerRunner>();
        private static readonly ProtobufTransportProtocolSerializationProvider DefaultTransportSerializationProvider = new ProtobufTransportProtocolSerializationProvider();
        private static readonly ProtobufProtocolSerializerFactory DefaultProtocolSerializationProvider = new ProtobufProtocolSerializerFactory();

        private readonly string _workingDir;
        private readonly CompositeTransportServer _transportServer;
        private readonly BrokerProcessor _brokerProcessor;

        public BrokerRunner(
            string metadataDir = null, 
            IRegistryProvider registryProvider = null,
            CancellationToken cancellationToken = default)
        {
            _workingDir = Directory.GetCurrentDirectory();
            metadataDir = metadataDir ?? Path.Combine(_workingDir, "metadata");
            registryProvider = registryProvider ?? JsonRegistryProvider.Initialize(Path.Combine(metadataDir, "interop.json"));
            _transportServer = new CompositeTransportServer(new[] { CreateNamedPipeServer(), CreateWebSocketServer() });
            _brokerProcessor = new BrokerProcessor(
                _transportServer,
                registryProvider,
                DefaultProtocolSerializationProvider,
                new AppLifecycleManager(metadataDir));
        }

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Info("Starting broker in directory {0}", _workingDir);
            await _transportServer.StartAsync().ConfigureAwait(false);
            await _brokerProcessor.StartAsync().ConfigureAwait(false);
            Log.Info("Broker started in directory {0}", _workingDir);
            return _brokerProcessor.Completion;
        }

        private ITransportServer CreateNamedPipeServer()
        {
            var pipeServer = new PipeTransmissionServer(_workingDir);
            return new TransportServer(pipeServer, DefaultTransportSerializationProvider);
        }

        private ITransportServer CreateWebSocketServer()
        {
            var webSocketServer = new WebSocketTransmissionServer(_workingDir);
            return new TransportServer(webSocketServer, DefaultTransportSerializationProvider);
        }
    }
}
