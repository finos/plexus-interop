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
namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using Newtonsoft.Json;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Transport;
    using Plexus.Processes;
    using UniqueId = Plexus.UniqueId;

    internal sealed class AppLifecycleManager : ProcessBase, IAppLifecycleManager
    {        
        private readonly Dictionary<UniqueId, IAppConnection> _connections
            = new Dictionary<UniqueId, IAppConnection>();

        private readonly Dictionary<UniqueId, List<IAppConnection>> _appInstanceConnections
            = new Dictionary<UniqueId, List<IAppConnection>>();

        private readonly Dictionary<UniqueId, Promise<IAppConnection>> _connectionWaiters
            = new Dictionary<UniqueId, Promise<IAppConnection>>();

        private readonly IClient _client;
        private readonly JsonSerializer _jsonSerializer = JsonSerializer.CreateDefault();
        private readonly NativeAppLauncherClient _nativeAppLauncherClient;
        private readonly AppsDto _appsDto;

        public AppLifecycleManager(string metadataDir)
        {
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir, _jsonSerializer);
            _appsDto = AppsDto.Load(Path.Combine(metadataDir, "apps.json"));
            _client = ClientFactory.Instance.Create(
                new ClientOptionsBuilder()
                    .WithBrokerWorkingDir(Directory.GetCurrentDirectory())
                    .WithDefaultConfiguration()
                    .WithApplicationId("interop.AppLifecycleManager")
                    .WithProvidedService("interop.AppLifecycleService",
                        s => s.WithUnaryMethod<ActivateAppRequest, ActivateAppResponse>("ActivateApp", ActivateAppAsync))
                    .Build());
            OnStop(_nativeAppLauncherClient.Stop);
            OnStop(_client.Disconnect);
        }        

        protected override ILogger Log { get; } = LogManager.GetLogger<AppLifecycleManager>();        

        protected override async Task<Task> StartCoreAsync()
        {
            await Task.WhenAll(_client.ConnectAsync(), _nativeAppLauncherClient.StartAsync());
            return ProcessAsync();
        }

        private Task ProcessAsync()
        {
            return Task.WhenAll(_client.Completion, _nativeAppLauncherClient.Completion);
        }

        public IAppConnection AcceptConnection(
            ITransportConnection connection,
            AppConnectionDescriptor info)
        {
            var clientConnection = new AppConnection(connection, info);
            lock (_connections)
            {
                if (_connections.ContainsKey(clientConnection.Id))
                {
                    throw new InvalidOperationException($"Connection id already exists: {clientConnection.Id}");
                }
                _connections[clientConnection.Id] = clientConnection;
                var appInstanceId = clientConnection.Info.ApplicationInstanceId;
                if (!_appInstanceConnections.TryGetValue(appInstanceId, out var connectionList))
                {
                    connectionList = new List<IAppConnection>();
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

        public bool TryGetOnlineConnection(UniqueId id, out IAppConnection connection)
        {
            lock (_connections)
            {
                return _connections.TryGetValue(id, out connection);
            }
        }

        public async Task<IAppConnection> SpawnConnectionAsync(string appId)
        {
            var appInstanceId = await LaunchAsync(appId).ConfigureAwait(false);
            Promise<IAppConnection> connectionPromise;
            lock (_connections)
            {
                if (_appInstanceConnections.TryGetValue(appInstanceId, out var connectionList) &&
                    connectionList.Count > 0)
                {
                    return connectionList.FirstOrDefault();
                }

                connectionPromise = new Promise<IAppConnection>();
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

        public ValueTask<IAppConnection> GetOrSpawnConnectionAsync(IAppConnection source, IReadOnlyCollection<string> appIds)
        {
            lock (_connections)
            {
                var targetConnection =
                    _connections.Values
                        .Where(x => x.Id != source.Id)
                        .Join(appIds, x => x.Info.ApplicationId, y => y, (x, y) => x)
                        .FirstOrDefault();
                if (targetConnection != null)
                {
                    return new ValueTask<IAppConnection>(targetConnection);
                }
            }
            var appIdToSpawn = GetAvailableApps(appIds).FirstOrDefault();
            if (string.IsNullOrEmpty(appIdToSpawn))
            {
                throw new InvalidOperationException($"Application is not available: {appIds.FormatEnumerable()}");
            }
            return new ValueTask<IAppConnection>(SpawnConnectionAsync(appIdToSpawn));
        }

        public IReadOnlyCollection<IAppConnection> GetOnlineConnections()
        {
            lock (_connections)
            {
                return _connections.Values.ToList();
            }
        }

        private void OnClientConnectionCompleted(Task completion, object state)
        {
            var connection = (IAppConnection)state;
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

        private async Task<ActivateAppResponse> ActivateAppAsync(ActivateAppRequest request, MethodCallContext context)
        {
            Log.Debug("Activating app {0} by request from {{{1}}}", request.AppId, context);
            var connection = await SpawnConnectionAsync(request.AppId).ConfigureAwait(false);
            Log.Info("App connection {{{0}}} activated by request from {{{1}}}", connection, context);
            var response = new ActivateAppResponse
            {
                AppConnectionId = new Internal.Generated.UniqueId
                {
                    Hi = connection.Info.ConnectionId.Hi,
                    Lo = connection.Info.ConnectionId.Lo
                },
                AppInstanceId = new Internal.Generated.UniqueId
                {
                    Hi = connection.Info.ApplicationInstanceId.Hi,
                    Lo = connection.Info.ApplicationInstanceId.Lo
                }
            };
            return response;
        }

        private async ValueTask<UniqueId> LaunchAsync(string appId)
        {
            Log.Info("Launching {0}", appId);

            var appDto = _appsDto.Apps.FirstOrDefault(x => string.Equals(x.Id, appId));
            if (appDto == null)
            {
                throw new InvalidOperationException($"The requested application {appId} is not defined in application registry");
            }

            if (string.IsNullOrEmpty(appDto.LauncherId))
            {
                throw new InvalidOperationException($"Launcher is not defined for application {appId}");
            }

            Log.Debug("Sending request to launcher {0}: appId={1}, params={2}", appDto.LauncherId, appId, appDto.LauncherParams);

            var launchMethodReference =
                ProvidedMethodReference.Create("interop.AppLauncherService", "Launch", appDto.LauncherId);

            var response = await _client.CallInvoker
                .CallUnary<AppLaunchRequest, AppLaunchResponse>(
                    launchMethodReference.CallDescriptor,
                    new AppLaunchRequest
                    {
                        AppId = appId,
                        LaunchParamsJson = appDto.LauncherParams.ToString()
                    })
                .ConfigureAwait(false);

            var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);

            Log.Info("Launched app {0} instance {1}", appId, appInstanceId);

            return appInstanceId;
        }

        private IEnumerable<string> GetAvailableApps(IEnumerable<string> appIds)
        {
            return appIds.Join(_appsDto.Apps, x => x, y => y.Id, (x, y) => x).Distinct();
        }
    }
}
