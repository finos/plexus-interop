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
namespace Plexus.Interop.Broker.Internal
{
    using System;
    using System.Collections.Concurrent;
    using System.Linq;
    using System.Threading.Tasks;
    using Plexus.Channels;
    using Plexus.Interop.Apps;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;
    using Plexus.Processes;

    internal sealed class BrokerProcessor : ProcessBase, IBrokerProcessor
    {        
        private static readonly IProtocolMessageFactory DefaultProtocolMessageFactory = ProtocolMessagePool.Instance;

        private readonly ConcurrentDictionary<UniqueId, ITransportConnection> _activeConnections
            = new ConcurrentDictionary<UniqueId, ITransportConnection>();

        private readonly IReadableChannel<ITransportConnection> _incomingConnections;
        private readonly IAppLifecycleManager _appLifecycleManager;
        private readonly AuthenticationHandler _authenticationHandler;
        private readonly ClientRequestHandler _clientRequestHandler;

        public BrokerProcessor(
            IReadableChannel<ITransportConnection> incomingConnections,
            IProtocolSerializerFactory serializerFactory,
            IInteropContext interopContext)
        {
            _incomingConnections = incomingConnections;
            var registryService = new RegistryService(interopContext.RegistryProvider);
            var protocol = new ProtocolImplementation(DefaultProtocolMessageFactory, serializerFactory);
            _authenticationHandler = new AuthenticationHandler(interopContext.AppLifecycleManager, protocol, registryService);
            _clientRequestHandler = new ClientRequestHandler(interopContext.AppLifecycleManager, protocol, registryService, interopContext.InvocationEventProvider);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<BrokerProcessor>();

        protected override Task<Task> StartCoreAsync()
        {
            return Task.FromResult(ProcessAsync());
        }

        private async Task ProcessAsync()
        {
            try
            {
                while (true)
                {
                    var transportConnectionResult = await _incomingConnections.TryReadAsync().ConfigureAwait(false);
                    if (transportConnectionResult.HasValue)
                    {
                        var transportConnection = transportConnectionResult.Value;
                        _activeConnections.TryAdd(transportConnection.Id, transportConnection);
                        TaskRunner
                            .RunInBackground(ProcessConnectionAsync, transportConnection)
                            .ContinueWithSynchronously((Action<Task, object>)OnConnectionProcessed, transportConnection)
                            .IgnoreAwait(Log);
                    }
                    else
                    {
                        Log.Trace("Transport connection listening completed");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                var activeConnections = _activeConnections.Values.ToArray();
                _activeConnections.Clear();
                foreach (var activeConnection in activeConnections)
                {
                    activeConnection.TryTerminate(ex);
                }
                throw;
            }
            finally
            {
                var activeConnections = _activeConnections.Values.ToArray();
                _activeConnections.Clear();
                if (activeConnections.Length > 0)
                {
                    Log.Info("Terminating {0} active connections", activeConnections.Length);
                    foreach (var activeConnection in activeConnections)
                    {
                        Log.Trace("Terminating connection {0}", activeConnection);
                        activeConnection.TryTerminate();
                    }
                    await Task.WhenAll(activeConnections.Select(x => x.Completion.IgnoreExceptions())).ConfigureAwait(false);
                    Log.Info("Terminated {0} active connections", activeConnections.Length);
                }
            }
        }

        private async Task ProcessConnectionAsync(object state)
        {
            var transportConnection = (ITransportConnection) state;
            Log.Debug("Accepting new incoming connection {0}", transportConnection.Id);
            var appConnectionDescriptor =
                await _authenticationHandler.AuthenticateAsync(transportConnection).ConfigureAwait(false);
            Log.Debug("New connection authenticated: {0}", appConnectionDescriptor);
            var clientConnection = _appLifecycleManager.AcceptConnection(transportConnection, appConnectionDescriptor);
            try
            {
                Log.Info("New connection accepted: {0}", clientConnection);
                var clientConnectionProcessor = new AppConnectionProcessor(clientConnection, _clientRequestHandler);
                await clientConnectionProcessor.Completion.ConfigureAwait(false);
            }
            finally
            {
                _appLifecycleManager.RemoveConnection(clientConnection);
            }
        }

        private void OnConnectionProcessed(Task completion, object state)
        {
            var connection = (ITransportConnection)state;
            if (completion.IsCanceled)
            {
                Log.Info("Connection {0} canceled", connection.Id);
                connection.TryTerminate();
            }
            else if (completion.IsFaulted)
            {
                Log.Warn(completion.Exception.ExtractInner(), "Connection {0} failed", connection.Id);
                connection.TryTerminate(completion.Exception.ExtractInner());
            }
            else
            {
                Log.Info("Connection {0} completed", connection.Id);
                connection.TryComplete();
            }            
            _activeConnections.TryRemove(connection.Id, out _);
            connection.IncomingChannels.ConsumeAsync(_ => { }).IgnoreExceptions().IgnoreAwait(Log);
        }
    }
}
