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
﻿namespace Plexus.Interop.Broker
{
    using Plexus.Interop.Apps;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Metamodel.Json;
    using Plexus.Interop.Protocol.Protobuf;
    using Plexus.Interop.Transport;
    using Plexus.Interop.Transport.Protocol.Protobuf;
    using Plexus.Interop.Transport.Transmission.Pipes;
    using Plexus.Interop.Transport.Transmission.WebSockets.Server;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;
    using ILogger = Plexus.ILogger;
    using LogManager = Plexus.LogManager;

    public sealed class BrokerRunner : StartableBase
    {        
        private static readonly ILogger Log = LogManager.GetLogger<BrokerRunner>();
        private static readonly ProtobufTransportProtocolSerializationProvider DefaultTransportSerializationProvider = new ProtobufTransportProtocolSerializationProvider();
        private static readonly ProtobufProtocolSerializerFactory DefaultProtocolSerializationProvider = new ProtobufProtocolSerializerFactory();

        private readonly string _workingDir;
        private readonly Semaphore _instanceSemaphore;        
        private readonly CompositeTransportServer _transportServer;
        private readonly IRegistryProvider _registryProvider;
        private readonly IAppLifecycleManager _appLifecycleManager;

        public BrokerRunner(string metadataDir = null, IRegistryProvider registryProvider = null)
        {
            _workingDir = Path.GetFullPath(Directory.GetCurrentDirectory());
            metadataDir = metadataDir ?? _workingDir;
            _registryProvider = registryProvider ??
                                JsonRegistryProvider.Initialize(Path.Combine(metadataDir, "interop.json"));
            _instanceSemaphore = new Semaphore(1, 1, $"Global{Path.DirectorySeparatorChar}plexus-interop-broker-semaphore-{_workingDir.Replace(Path.DirectorySeparatorChar, ':')}");
            _transportServer = new CompositeTransportServer(new[] { CreateNamedPipeServer(), CreateWebSocketServer() });
            _appLifecycleManager = new AppLifecycleManager(metadataDir, _workingDir);
        }

        protected override async Task<Task> StartProcessAsync(CancellationToken stopCancellationToken)
        {
            Log.Debug("Trying to accure instance semaphore");
            if (!_instanceSemaphore.WaitOne(0))
            {
                throw new BrokerIsAlreadyRunningException(_workingDir);
            }            
            try
            {
                stopCancellationToken.ThrowIfCancellationRequested();
                Log.Info("Starting broker in directory {0}", _workingDir);
                BrokerProcessor brokerProcess;
                using (stopCancellationToken.Register(OnStop))
                {                    
                    await _transportServer.StartAsync().ConfigureAwait(false);
                    brokerProcess = new BrokerProcessor(
                        _transportServer,
                        _registryProvider,
                        DefaultProtocolSerializationProvider,
                        _appLifecycleManager);
                    Log.Info("Broker started in directory {0}", _workingDir);
                }
                return TaskRunner.RunInBackground(
                    async () =>
                    {
                        try
                        {
                            using (stopCancellationToken.Register(OnStop))
                            {
                                await brokerProcess.Completion.ConfigureAwait(false);
                            }
                        }
                        finally
                        {
                            _instanceSemaphore.Release();
                        }
                    },
                    stopCancellationToken);
            }
            catch
            {
                _instanceSemaphore.Release();
                throw;
            }
        }

        private void OnStop()
        {
            Log.Debug("Stopping transport servers");
            _transportServer.StopAsync().IgnoreAwait(Log);
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
