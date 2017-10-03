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
﻿namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Interop.Apps;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    internal sealed class ClientConnectionTracker : IClientConnectionTracker
    {        
        private static readonly ILogger Log = LogManager.GetLogger<ClientConnectionProcessor>();

        private readonly Dictionary<UniqueId, IClientConnection> _connections
            = new Dictionary<UniqueId, IClientConnection>();

        private readonly Dictionary<UniqueId, List<IClientConnection>> _appInstanceConnections
            = new Dictionary<UniqueId, List<IClientConnection>>();

        private readonly Dictionary<UniqueId, Promise<IClientConnection>> _connectionWaiters
            = new Dictionary<UniqueId, Promise<IClientConnection>>();

        private readonly IAppLauncher _appLauncher;

        public ClientConnectionTracker(IAppLauncher appLauncher)
        {
            _appLauncher = appLauncher;
        }

        public IClientConnection AcceptConnection(
            ITransportConnection connection,
            ClientConnectionDescriptor info)
        {
            var clientConnection = new ClientConnection(connection, info);
            lock (_connections)
            {
                if (_connections.ContainsKey(clientConnection.Id))
                {
                    throw new BrokerException($"Connection id already exists: {clientConnection.Id}");
                }
                _connections[clientConnection.Id] = clientConnection;
                var appInstanceId = clientConnection.Info.ApplicationInstanceId;
                if (!_appInstanceConnections.TryGetValue(appInstanceId, out var connectionList))
                {
                    connectionList = new List<IClientConnection>();
                    _appInstanceConnections[appInstanceId] = connectionList;
                }
                connectionList.Add(clientConnection);
                clientConnection.Completion
                    .ContinueWithSynchronously((Action<Task, object>)OnClientConnectionCompleted, clientConnection)
                    .IgnoreAwait(Log);
                if (_connectionWaiters.TryGetValue(appInstanceId, out var waiter))
                {
                    waiter.TryComplete(clientConnection);
                }
                _connectionWaiters.Remove(info.ApplicationInstanceId);
            }
            return clientConnection;
        }

        public bool TryGetOnlineConnection(UniqueId id, out IClientConnection connection)
        {
            lock (_connections)
            {
                return _connections.TryGetValue(id, out connection);
            }
        }

        private async Task<IClientConnection> SpawnConnectionAsync(string appId)
        {
            var appInstanceId = await _appLauncher.LaunchAsync(appId).ConfigureAwait(false);
            Promise<IClientConnection> connectionPromise;
            lock (_connections)
            {
                if (_appInstanceConnections.TryGetValue(appInstanceId, out var connectionList) &&
                    connectionList.Count > 0)
                {
                    return connectionList.FirstOrDefault();
                }

                connectionPromise = new Promise<IClientConnection>();
                _connectionWaiters[appInstanceId] = connectionPromise;
                connectionPromise.Task.ContinueWithSynchronously(
                    _ =>
                    {
                        lock (_connections)
                        {
                            _connectionWaiters.Remove(appInstanceId);
                        }
                    }).IgnoreAwait(Log);                
            }
            return await connectionPromise.Task.ConfigureAwait(false);
        }

        public ValueTask<IClientConnection> GetOrSpawnConnectionAsync(IReadOnlyCollection<string> appIds)
        {
            lock (_connections)
            {
                var targetConnection =
                    _connections.Values
                        .Join(appIds, x => x.Info.ApplicationId, y => y, (x, y) => x)
                        .FirstOrDefault();
                if (targetConnection != null)
                {
                    return new ValueTask<IClientConnection>(targetConnection);
                }
            }
            var appIdToSpawn = _appLauncher.GetAvailableApps(appIds).FirstOrDefault();
            if (string.IsNullOrEmpty(appIdToSpawn))
            {
                throw new BrokerException($"Application is not available: {appIds.FormatEnumerable()}");
            }
            return new ValueTask<IClientConnection>(SpawnConnectionAsync(appIdToSpawn));
        }

        public IReadOnlyCollection<IClientConnection> GetOnlineConnections()
        {
            lock (_connections)
            {
                return _connections.Values.ToList();
            }
        }

        private void OnClientConnectionCompleted(Task completion, object state)
        {
            var connection = (IClientConnection)state;
            lock (_connections)
            {
                _connections.Remove(connection.Id);
                var appInstanceId = connection.Info.ApplicationInstanceId;
                if (_appInstanceConnections.TryGetValue(connection.Info.ApplicationInstanceId, out var list))
                {
                    list.Remove(connection);
                    if (list.Count == 0)
                    {
                        _appInstanceConnections.Remove(appInstanceId);
                    }
                }
            }
        }
    }
}
