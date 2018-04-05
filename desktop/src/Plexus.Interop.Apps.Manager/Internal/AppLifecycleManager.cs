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
    using Newtonsoft.Json;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Transport;
    using Plexus.Processes;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using UniqueId = Plexus.UniqueId;

    internal sealed class AppLifecycleManager : ProcessBase, IAppLifecycleManager, AppLifecycleManagerClient.IAppLifecycleServiceImpl
    {        
        private readonly Dictionary<UniqueId, IAppConnection> _connections
            = new Dictionary<UniqueId, IAppConnection>();

        private readonly Dictionary<UniqueId, List<IAppConnection>> _appInstanceConnections
            = new Dictionary<UniqueId, List<IAppConnection>>();

        private readonly Dictionary<string, List<IAppConnection>> _appConnections
            = new Dictionary<string, List<IAppConnection>>();

        private readonly Dictionary<UniqueId, Promise<IAppConnection>> _appInstanceConnectionWaiters
            = new Dictionary<UniqueId, Promise<IAppConnection>>();

        private readonly Dictionary<string, List<Task<IAppConnection>>> _appConnectionTasks
            = new Dictionary<string, List<Task<IAppConnection>>>();

        private readonly IAppLifecycleManagerClient _client;
        private readonly JsonSerializer _jsonSerializer = JsonSerializer.CreateDefault();
        private readonly NativeAppLauncherClient _nativeAppLauncherClient;
        private readonly AppsDto _appsDto;

        public AppLifecycleManager(string metadataDir)
        {
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir, _jsonSerializer);
            _appsDto = AppsDto.Load(Path.Combine(metadataDir, "apps.json"));
            _client = new AppLifecycleManagerClient(
                this, 
                s => s.WithBrokerWorkingDir(Directory.GetCurrentDirectory()));
            OnStop(_nativeAppLauncherClient.Stop);
            OnStop(_client.Disconnect);
        }        

        protected override ILogger Log { get; } = LogManager.GetLogger<AppLifecycleManager>();        

        protected override async Task<Task> StartCoreAsync()
        {
            await Task.WhenAll(_client.ConnectAsync(), _nativeAppLauncherClient.StartAsync());
            return Task.WhenAll(_client.Completion, _nativeAppLauncherClient.Completion);
        }

        public IAppConnection AcceptConnection(
            ITransportConnection connection,
            AppConnectionDescriptor info)
        {
            lock (_connections)
            {
                var clientConnection = new AppConnection(connection, info);
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

                var appId = clientConnection.Info.ApplicationId;
                if (!_appConnections.TryGetValue(appId, out var appConnectionList))
                {
                    appConnectionList = new List<IAppConnection>();
                    _appConnections[appId] = appConnectionList;
                }
                appConnectionList.Add(clientConnection);

                Log.Debug("New connection accepted: {{{0}}}", clientConnection);

                if (_appInstanceConnectionWaiters.TryGetValue(appInstanceId, out var waiter))
                {
                    Log.Debug("Resolving deferred connection for app instance {0} to accepted connection {{{1}}}", appInstanceId, connection);
                    waiter.TryComplete(clientConnection);
                    _appInstanceConnectionWaiters.Remove(appInstanceId);
                }

                return clientConnection;
            }
        }

        public void RemoveConnection(IAppConnection connection)
        {
            lock (_connections)
            {
                Log.Debug("Removing connection {0}", connection.Info);

                _connections.Remove(connection.Id);

                var appInstanceId = connection.Info.ApplicationInstanceId;
                if (_appInstanceConnections.TryGetValue(appInstanceId, out var list))
                {
                    list.Remove(connection);
                    if (list.Count == 0)
                    {
                        _appInstanceConnections.Remove(appInstanceId);
                    }
                }

                var appId = connection.Info.ApplicationId;
                if (_appConnections.TryGetValue(appId, out var appConnectionList))
                {
                    appConnectionList.Remove(connection);
                    if (appConnectionList.Count == 0)
                    {
                        _appConnections.Remove(appId);
                    }
                }

                if (_appInstanceConnectionWaiters.TryGetValue(appInstanceId, out var waiter))
                {
                    waiter.TryCancel();
                    _appInstanceConnectionWaiters.Remove(appInstanceId);
                }
            }
        }

        public bool TryGetOnlineConnection(UniqueId id, out IAppConnection connection)
        {
            lock (_connections)
            {
                return _connections.TryGetValue(id, out connection);
            }
        }

        public IEnumerable<string> FilterCanBeLaunched(IEnumerable<string> appIds)
        {
            // .Where(x => !string.IsNullOrEmpty(x.LauncherId))
            return appIds.Join(_appsDto.Apps, x => x, y => y.Id, (x, y) => x).Distinct();
        }

        public bool CanBeLaunched(string appId)
        {
            return FilterCanBeLaunched(new[] { appId }).Contains(appId);
        }

        public async Task<ResolvedConnection> ResolveConnectionAsync(string appId, ResolveMode mode)
        {
            Log.Debug("Resolving connection for app {0} with mode {1}", appId, mode);
            Task<IAppConnection> connectionTask;
            UniqueId suggestedInstanceId = default;
            lock (_connections)
            {
                if (mode == ResolveMode.SingleInstance)
                {
                    if (_appConnections.TryGetValue(appId, out var appConnectionList) && appConnectionList.Any())
                    {
                        var connection = appConnectionList.First();
                        Log.Debug("Resolved connection for app {0} with mode {1} to online instance {{{2}}}", appId, mode, connection);
                        return new ResolvedConnection(connection, false);
                    }
                } 

                if (mode != ResolveMode.MultiInstance 
                    && _appConnectionTasks.TryGetValue(appId, out var appConnectionTaskList) 
                    && appConnectionTaskList.Any())
                {
                    Log.Debug("Resolving connection for app {0} with mode {1} to launching instance", appId, mode);
                    connectionTask = appConnectionTaskList.First();
                }
                else
                {
                    suggestedInstanceId = UniqueId.Generate();
                    Log.Debug("Resolving connection for app {0} with mode {1} to new instance with suggested id {2}", appId, mode, suggestedInstanceId);
                    connectionTask = LaunchAndWaitConnectionAsync(appId, suggestedInstanceId, mode);
                }
            }
            var resolvedConnection = await connectionTask.ConfigureAwait(false);
            Log.Debug("Resolved connection for app {0} with mode {1} to launched instance {{{2}}}", appId, mode, resolvedConnection);
            return new ResolvedConnection(resolvedConnection, suggestedInstanceId == resolvedConnection.Id);
        }
        
        public IReadOnlyCollection<IAppConnection> GetOnlineConnections()
        {
            lock (_connections)
            {
                return _connections.Values.ToList();
            }
        }

        async Task<ResolveAppResponse> AppLifecycleService.IResolveAppImpl.ResolveApp(
            ResolveAppRequest request, MethodCallContext context)
        {
            Log.Debug("Resolving app by request {{{0}}} from {{{1}}}", request, context);
            var resolvedConnection = await ResolveConnectionAsync(request.AppId, Convert(request.AppResolveMode)).ConfigureAwait(false);
            var info = resolvedConnection.AppConnection.Info;
            Log.Info("App connection {{{0}}} resolved by request from {{{1}}}", resolvedConnection, context);
            var response = new ResolveAppResponse
            {
                AppConnectionId = new Generated.UniqueId
                {
                    Hi = info.ConnectionId.Hi,
                    Lo = info.ConnectionId.Lo
                },
                AppInstanceId = new Generated.UniqueId
                {
                    Hi = info.ApplicationInstanceId.Hi,
                    Lo = info.ApplicationInstanceId.Lo
                },
                IsNewInstanceLaunched = resolvedConnection.IsNewInstance
            };
            return response;
        }

        private async Task<IAppConnection> LaunchAndWaitConnectionAsync(string appId, UniqueId suggestedAppInstanceId, ResolveMode resolveMode)
        {
            var appInstanceId = suggestedAppInstanceId;
            Log.Info("Launching {0}", appId);
            var connectionPromise = new Promise<IAppConnection>();
            try
            {
                lock (_connections)
                {
                    if (!_appConnectionTasks.TryGetValue(appId, out var appConnectionTaskList))
                    {
                        appConnectionTaskList = new List<Task<IAppConnection>>();
                        _appConnectionTasks[appId] = appConnectionTaskList;
                    }
                    appConnectionTaskList.Add(connectionPromise.Task);
                }

                appInstanceId = await LaunchAsync(appId, appInstanceId, resolveMode).ConfigureAwait(false);

                lock (_connections)
                {
                    if (_appInstanceConnections.TryGetValue(appInstanceId, out var connectionList) && connectionList.Any())
                    {
                        var connection = connectionList.First();
                        Log.Debug("Resolving deferred connection for app instance {0} to connection {{{1}}}", appInstanceId, connection);
                        connectionPromise.TryComplete(connection);
                    }
                    else
                    {
                        _appInstanceConnectionWaiters[appInstanceId] = connectionPromise;
                    }
                }

                return await connectionPromise.Task.ConfigureAwait(false);
            }
            finally
            {
                lock (_connections)
                {
                    _appInstanceConnectionWaiters.Remove(appInstanceId);
                    if (_appConnectionTasks.TryGetValue(appId, out var appConnectionTaskList))
                    {
                        appConnectionTaskList.Remove(connectionPromise.Task);
                        if (!appConnectionTaskList.Any())
                        {
                            _appConnectionTasks.Remove(appId);
                        }
                    }
                }
            }
        }

        private async Task<UniqueId> LaunchAsync(string appId, UniqueId suggestedAppInstanceId, ResolveMode resolveMode)
        {            
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
                        LaunchParamsJson = appDto.LauncherParams.ToString(),
                        SuggestedAppInstanceId = new Generated.UniqueId
                        {
                            Hi = suggestedAppInstanceId.Hi,
                            Lo = suggestedAppInstanceId.Lo
                        },
                        LaunchMode = Convert(resolveMode)
                    })
                .ConfigureAwait(false);

            var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);

            Log.Info("Received launch response for app {0} from {1}: {2}", appId, appDto.LauncherId, response);

            return appInstanceId;
        }

        private static ResolveMode Convert(AppLaunchMode launchMode)
        {
            switch (launchMode)
            {
                case AppLaunchMode.SingleInstance:
                    return ResolveMode.SingleInstance;
                case AppLaunchMode.MultiInstance:
                    return ResolveMode.MultiInstance;
                default:
                    throw new ArgumentOutOfRangeException(nameof(launchMode), launchMode, null);
            }
        }

        private static AppLaunchMode Convert(ResolveMode resolveMode)
        {
            switch (resolveMode)
            {
                case ResolveMode.SingleInstance:
                    return AppLaunchMode.SingleInstance;
                case ResolveMode.SingleLaunchingInstance:
                    return AppLaunchMode.MultiInstance;
                case ResolveMode.MultiInstance:
                    return AppLaunchMode.MultiInstance;
                default:
                    throw new ArgumentOutOfRangeException(nameof(resolveMode), resolveMode, null);
            }
        }
    }
}
