/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
        private readonly Dictionary<UniqueId, IAppConnection> _connections
            = new Dictionary<UniqueId, IAppConnection>();

        private readonly Dictionary<UniqueId, Dictionary<string, IAppConnection>> _appInstanceConnections
            = new Dictionary<UniqueId, Dictionary<string, IAppConnection>>();

        private readonly Dictionary<string, List<IAppConnection>> _appConnections
            = new Dictionary<string, List<IAppConnection>>();

        private readonly Dictionary<(UniqueId AppInstanceId, string AppId), Promise<IAppConnection>> _appInstanceConnectionsInProgress
            = new Dictionary<(UniqueId, string), Promise<IAppConnection>>();

        private readonly IAppRegistryProvider _appRegistryProvider;
        private readonly Lazy<IClient> _clientLazy;

        private readonly Subject<AppConnectionEvent> _connectionSubject = new Subject<AppConnectionEvent>();

        public AppLifecycleManager(IAppRegistryProvider appRegistryProvider, Lazy<IClient> clientLazy)
        {
            _appRegistryProvider = appRegistryProvider;
            _clientLazy = clientLazy;
            ConnectionEventsStream = _connectionSubject.ObserveOn(TaskPoolScheduler.Default);
        }        

        private ILogger Log { get; } = LogManager.GetLogger<AppLifecycleManager>();

        public IObservable<AppConnectionEvent> ConnectionEventsStream { get; }

        public IReadOnlyCollection<IAppConnection> GetAppInstanceConnections(UniqueId appInstanceId)
        {
            lock (_connections)
            {
                if (_appInstanceConnections.TryGetValue(appInstanceId, out Dictionary<string, IAppConnection> connections))
                {
                    return connections.Values.ToList();
                }
                return new IAppConnection[0];
            }
        }

        public IAppConnection AcceptConnection(
            ITransportConnection connection,
            AppConnectionDescriptor connectionInfo)
        {
            lock (_connections)
            {
                var clientConnection = new AppConnection(connection, connectionInfo);
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
                if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out var waiter))
                {
                    Log.Debug("Resolving deferred connection {{{0}}} to accepted connection {{{1}}}", deferredConnectionKey, connection);
                    waiter.TryComplete(clientConnection);
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }

                _connectionSubject.OnNext(new AppConnectionEvent(connectionInfo, ConnectionEventType.AppConnected));

                return clientConnection;
            }
        }

        public void RemoveConnection(IAppConnection connection)
        {
            Log.Debug("Removing connection {0}", connection.Info);

            lock (_connections)
            {                
                _connections.Remove(connection.Id);

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
                if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out var waiter))
                {
                    waiter.TryCancel();
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }
            }

            _connectionSubject.OnNext(new AppConnectionEvent(connection.Info, ConnectionEventType.AppDisconnected));
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
            return appIds.Join(_appRegistryProvider.Current.Apps, x => x, y => y.Id, (x, y) => x).Distinct();
        }

        public bool CanBeLaunched(string appId)
        {
            return FilterCanBeLaunched(new[] { appId }).Contains(appId);
        }

        public async Task<ResolvedConnection> LaunchAndConnectAsync(string appId, ResolveMode mode, AppConnectionDescriptor referrerConnectionInfo)
        {
            var suggestedInstanceId = UniqueId.Generate();
            Log.Debug("Resolving connection for app {0} with mode {1} to new instance with suggested id {2}",
                appId, mode, suggestedInstanceId);
            var connectionTask = LaunchAndWaitConnectionAsync(appId, suggestedInstanceId, mode, referrerConnectionInfo);
            var resolvedConnection = await connectionTask.ConfigureAwait(false);
            Log.Debug("Resolved connection for app {0} with mode {1} to launched instance {{{2}}} by request from {{{3}}}", 
                appId, mode, resolvedConnection, referrerConnectionInfo);
            return new ResolvedConnection(resolvedConnection, suggestedInstanceId == resolvedConnection.Info.ApplicationInstanceId);
        }

        public IReadOnlyCollection<IAppConnection> GetOnlineConnections()
        {
            lock (_connections)
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
            var connectionPromise = new Promise<IAppConnection>();
            var deferredConnectionKey = (suggestedAppInstanceId, appId);
            try
            {
                appInstanceId = await LaunchAsync(appId, appInstanceId, resolveMode, referrerConnectionInfo).ConfigureAwait(false);

                deferredConnectionKey = (appInstanceId, appId);

                lock (_connections)
                {
                    if (_appInstanceConnections.TryGetValue(appInstanceId, out var connections) && connections.Any())
                    {
                        var existingConnection = connections.First().Value;
                        Log.Debug("Resolving deferred connection {{{0}}} to existing connection {{{1}}}", deferredConnectionKey, existingConnection);
                        connectionPromise.TryComplete(existingConnection);
                    }
                    else
                    {
                        _appInstanceConnectionsInProgress[deferredConnectionKey] = connectionPromise;
                    }
                }

                return await connectionPromise.Task.ConfigureAwait(false);
            }
            finally
            {
                lock (_connections)
                {
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }
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

            Log.Debug("Sending request to launcher {0}: appId={1}, params={2}", appDto.LauncherId, appId, appDto.LauncherParams);

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

            var response = await _clientLazy.Value.CallInvoker
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
