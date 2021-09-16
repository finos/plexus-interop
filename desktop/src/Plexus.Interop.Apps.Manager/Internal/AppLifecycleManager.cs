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
namespace Plexus.Interop.Apps.Internal
{
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reactive.Concurrency;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps.Internal.Generated;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;
    using UniqueId = Plexus.UniqueId;

    internal sealed class AppLifecycleManager : IAppLifecycleManager
    {
        private readonly object _sync = new object();
        private readonly HashSet<UniqueId> _appInstanceIds = new HashSet<UniqueId>();
        private readonly Dictionary<UniqueId, IAppConnection> _connections = new Dictionary<UniqueId, IAppConnection>();
        private readonly Dictionary<UniqueId, Dictionary<string, IAppConnection>> _appInstanceConnections = new Dictionary<UniqueId, Dictionary<string, IAppConnection>>();
        private readonly Dictionary<string, List<IAppConnection>> _appConnections = new Dictionary<string, List<IAppConnection>>();

        private readonly Dictionary<(UniqueId AppInstanceId, string AppId), Promise<IAppConnection>> _appInstanceConnectionsInProgress = new Dictionary<(UniqueId, string), Promise<IAppConnection>>();

        private readonly IAppRegistryProvider _appRegistryProvider;
        private readonly IAppLifecycleManagerClientClientRepository _appLifecycleManagerClientClientRepo;

        private readonly Subject<AppConnectionEvent> _connectionSubject = new Subject<AppConnectionEvent>();

        public AppLifecycleManager(
            IAppRegistryProvider appRegistryProvider,
            IAppLaunchedEventProvider appLaunchedEventProvider,
            IAppLifecycleManagerClientClientRepository appLifecycleManagerClientClientRepo)
        {
            _appRegistryProvider = appRegistryProvider;
            _appLifecycleManagerClientClientRepo = appLifecycleManagerClientClientRepo;
            ConnectionEventsStream = _connectionSubject.ObserveOn(TaskPoolScheduler.Default);
            appLaunchedEventProvider.AppLaunchedStream.Subscribe(OnApplicationLaunchedEvent);
        }

        private ILogger Log { get; } = LogManager.GetLogger<AppLifecycleManager>();

        public IObservable<AppConnectionEvent> ConnectionEventsStream { get; }

        public IReadOnlyCollection<IAppConnection> GetAppInstanceConnections(UniqueId appInstanceId)
        {
            lock (_sync)
            {
                if (_appInstanceConnections.TryGetValue(appInstanceId, out Dictionary<string, IAppConnection> connections))
                {
                    return connections.Values.ToList();
                }
                return new IAppConnection[0];
            }
        }

        public IReadOnlyCollection<IAppConnection> GetAppConnections(string appId)
        {
            lock (_sync)
            {
                if (_appConnections.TryGetValue(appId, out var appConnections))
                {
                    return appConnections.ToList();
                }
                return new IAppConnection[0];
            }
        }

        public IAppConnection AcceptConnection(
            ITransportConnection connection,
            AppConnectionDescriptor connectionInfo)
        {
            AppConnection clientConnection;
            Promise<IAppConnection> waiter;
            lock (_sync)
            {
                clientConnection = new AppConnection(connection, connectionInfo);
                if (_connections.ContainsKey(clientConnection.Id))
                {
                    throw new InvalidOperationException($"Connection id already exists: {clientConnection.Id}");
                }

                _connections[clientConnection.Id] = clientConnection;
                var appInstanceId = clientConnection.Info.ApplicationInstanceId;
                if (!_appInstanceConnections.TryGetValue(appInstanceId, out var appConnections))
                {
                    appConnections = new Dictionary<string, IAppConnection>();
                    _appInstanceConnections[appInstanceId] = appConnections;
                }
                appConnections[clientConnection.Info.ApplicationId] = clientConnection;

                var appId = clientConnection.Info.ApplicationId;
                if (!_appConnections.TryGetValue(appId, out var appConnectionList))
                {
                    appConnectionList = new List<IAppConnection>();
                    _appConnections[appId] = appConnectionList;
                }
                appConnectionList.Add(clientConnection);

                Log.Debug("New connection accepted: {{{0}}}", clientConnection);

                var deferredConnectionKey = (appInstanceId, appId);
                if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out waiter))
                {
                    Log.Debug("Resolving deferred connection {{{0}}} to accepted connection {{{1}}}", deferredConnectionKey, connection);
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }
            }

            waiter?.TryComplete(clientConnection);
            _connectionSubject.OnNext(new AppConnectionEvent(connectionInfo, ConnectionEventType.AppConnected));

            return clientConnection;
        }

        public bool TryRemoveConnection(IAppConnection connection)
        {
            Log.Debug("Removing connection {0}", connection.Info);
            Promise<IAppConnection> waiter;
            lock (_sync)
            {
                if (!_connections.Remove(connection.Id))
                {
                    return false;
                }

                var appInstanceId = connection.Info.ApplicationInstanceId;
                var appId = connection.Info.ApplicationId;
                if (_appInstanceConnections.TryGetValue(appInstanceId, out var connections))
                {
                    connections.Remove(appId);
                    if (connections.Count == 0)
                    {
                        _appInstanceConnections.Remove(appInstanceId);
                    }
                }

                if (_appConnections.TryGetValue(appId, out var appConnectionList))
                {
                    appConnectionList.Remove(connection);
                    if (appConnectionList.Count == 0)
                    {
                        _appConnections.Remove(appId);
                    }
                }

                var deferredConnectionKey = (appInstanceId, connection.Info.ApplicationId);
                if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out waiter))
                {
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }
            }

            waiter?.TryCancel();
            _connectionSubject.OnNext(new AppConnectionEvent(connection.Info, ConnectionEventType.AppDisconnected));
            return true;
        }

        public bool TryGetConnectionInProgress(UniqueId appInstanceId, string appId, out Task<IAppConnection> appConnection)
        {
            lock (_sync)
            {
                if (_appInstanceConnections.TryGetValue(appInstanceId, out var connections) && connections.TryGetValue(appId, out var existingConnection))
                {
                    appConnection = Task.FromResult(existingConnection);
                    return true;
                }
                if (_appInstanceConnectionsInProgress.TryGetValue((appInstanceId, appId), out var promise))
                {
                    appConnection = promise.Task;
                    return true;
                }

                appConnection = null;
                return false;
            }
        }

        public bool TryGetOnlineConnection(UniqueId connectionId, out IAppConnection connection)
        {
            lock (_sync)
            {
                return _connections.TryGetValue(connectionId, out connection);
            }
        }

        public bool TryGetOnlineConnection(UniqueId appInstanceId, string app, out IAppConnection connection)
        {
            connection = null;
            lock (_sync)
            {
                return _appInstanceConnections.TryGetValue(appInstanceId, out var appConnections) &&
                       appConnections.TryGetValue(app, out connection);
            }
        }

        public IEnumerable<string> FilterCanBeLaunched(IEnumerable<string> appIds)
        {
            return appIds.Join(_appRegistryProvider.Current.Apps, x => x, y => y.Id, (x, y) => x).Distinct();
        }

        public bool CanBeLaunched(string appId)
        {
            return FilterCanBeLaunched(new[] { appId }).Contains(appId);
        }

        public async Task<ResolvedConnection> LaunchAndConnectAsync(string appId, ResolveMode mode, AppConnectionDescriptor referrerConnectionInfo)
        {
            var suggestedInstanceId = UniqueId.Generate();
            Log.Debug($"Resolving connection for app {appId} with mode {mode} to new instance with suggested id {suggestedInstanceId}");
            var resolvedConnection = await LaunchAndWaitConnectionAsync(appId, suggestedInstanceId, mode, referrerConnectionInfo).ConfigureAwait(false);

            Log.Debug($"Resolved connection for app {appId} with mode {mode} to launched instance {{{resolvedConnection}}} by request from {{{referrerConnectionInfo}}}");
            return new ResolvedConnection(resolvedConnection, suggestedInstanceId == resolvedConnection.Info.ApplicationInstanceId);
        }

        public IReadOnlyCollection<IAppConnection> GetOnlineConnections()
        {
            lock (_sync)
            {
                return _connections.Values.ToList();
            }
        }

        private async Task<IAppConnection> LaunchAndWaitConnectionAsync(
            string appId,
            UniqueId suggestedAppInstanceId,
            ResolveMode resolveMode,
            AppConnectionDescriptor referrerConnectionInfo)
        {
            var appInstanceId = suggestedAppInstanceId;
            Log.Info("Launching {0}", appId);
            var deferredConnectionKey = (suggestedAppInstanceId, appId);
            try
            {
                appInstanceId = await LaunchAsync(appId, appInstanceId, resolveMode, referrerConnectionInfo).ConfigureAwait(false);

                deferredConnectionKey = (appInstanceId, appId);

                Promise<IAppConnection> connectionPromise;
                lock (_sync)
                {
                    if (_appInstanceConnections.TryGetValue(appInstanceId, out var connections) && connections.TryGetValue(appId, out var existingConnection))
                    {
                        Log.Debug("Resolving deferred connection {{{0}}} to existing connection {{{1}}}", deferredConnectionKey, existingConnection);
                        return existingConnection;
                    }
                    else
                    {
                        if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out var existingPromise))
                        {
                            connectionPromise = existingPromise;
                        }
                        else
                        {
                            connectionPromise = new Promise<IAppConnection>();
                            _appInstanceConnectionsInProgress[deferredConnectionKey] = connectionPromise;
                        }
                    }
                }

                return await connectionPromise.Task.ConfigureAwait(false);
            }
            finally
            {
                lock (_sync)
                {
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }
            }
        }

        private void OnApplicationLaunchedEvent(AppLaunchedEvent appLaunchedEvent)
        {
            var appInstanceId = appLaunchedEvent.AppInstanceId.ToUniqueId();
            RegisterAppInstanceConnection(appLaunchedEvent.AppIds, appInstanceId);
        }

        public void RegisterAppInstanceConnection(string appId, UniqueId appInstanceId)
        {
            RegisterAppInstanceConnection(new[] { appId }, appInstanceId);
        }

        private void RegisterAppInstanceConnection(IEnumerable<string> appIds, UniqueId appInstanceId)
        {
            lock (_sync)
            {
                foreach (var appId in appIds)
                {
                    if (_appInstanceConnections.TryGetValue(appInstanceId, out var connections) && connections.TryGetValue(appId, out var _))
                    {
                        continue;
                    }
                    var deferredConnectionKey = (appInstanceId, appId);
                    if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out _))
                    {
                        continue;
                    }
                    _appInstanceConnectionsInProgress[deferredConnectionKey] = new Promise<IAppConnection>();
                }
                RegisterAppInstance(appInstanceId);
            }
        }

        public void RegisterAppInstance(UniqueId appInstanceId)
        {
            lock (_sync)
            {
                _appInstanceIds.Add(appInstanceId);
            }
        }

        public bool IsAppInstanceRegistered(UniqueId appInstanceId)
        {
            lock (_sync)
            {
                return _appInstanceIds.Contains(appInstanceId);
            }
        }

        private async Task<UniqueId> LaunchAsync(
            string appId,
            UniqueId suggestedAppInstanceId,
            ResolveMode resolveMode,
            AppConnectionDescriptor referrerConnectionInfo)
        {
            var appDto = _appRegistryProvider.Current.Apps.FirstOrDefault(x => string.Equals(x.Id, appId));
            if (appDto == null)
            {
                throw new InvalidOperationException($"The requested application {appId} is not defined in application registry");
            }

            if (string.IsNullOrEmpty(appDto.LauncherId))
            {
                throw new InvalidOperationException($"Launcher is not defined for application {appId}");
            }

            Log.Debug("Sending request to launcher {0}: appId={1}, params={2}", appDto.LauncherId, appId, string.Join("; ", appDto.LauncherParams.Select(kvp => $"{kvp.Key}:{kvp.Value}")));

            var referrer = new AppLaunchReferrer
            {
                AppId = referrerConnectionInfo.ApplicationId,
                AppInstanceId = referrerConnectionInfo.ApplicationInstanceId.ToProto(),
                ConnectionId = referrerConnectionInfo.ConnectionId.ToProto()
            };

            var request = new AppLaunchRequest
            {
                AppId = appId,
                LaunchParamsJson = JsonConvert.Serialize(appDto.LauncherParams),
                SuggestedAppInstanceId = suggestedAppInstanceId.ToProto(),
                LaunchMode = Convert(resolveMode),
                Referrer = referrer
            };

            var response = await LaunchUsingLauncherAsync(appDto.LauncherId, request).ConfigureAwait(false);

            var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);

            Log.Info("Received launch response for app {0} from {1}: {2}", appId, appDto.LauncherId, response);

            return appInstanceId;
        }

        private async Task<AppLaunchResponse> LaunchUsingLauncherAsync(string launcherId, AppLaunchRequest request)
        {
            var appLauncherServiceId = AppLauncherService.Id;
            var launchMethodId = AppLauncherService.LaunchMethodId;
            var launchMethodReference = ProvidedMethodReference.Create(appLauncherServiceId, launchMethodId, launcherId);

            var client = await _appLifecycleManagerClientClientRepo.GetClientAsync().ConfigureAwait(false);

            var response = await client.CallInvoker
                .CallUnary<AppLaunchRequest, AppLaunchResponse>(launchMethodReference.CallDescriptor, request)
                .ConfigureAwait(false);

            return response;
        }

        private static AppLaunchMode Convert(ResolveMode resolveMode)
        {
            switch (resolveMode)
            {
                case ResolveMode.SingleInstance:
                    return AppLaunchMode.SingleInstance;
                case ResolveMode.MultiInstance:
                    return AppLaunchMode.MultiInstance;
                default:
                    throw new ArgumentOutOfRangeException(nameof(resolveMode), resolveMode, null);
            }
        }
    }
}
