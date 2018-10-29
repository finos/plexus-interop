/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
    using Google.Protobuf.WellKnownTypes;
    using Newtonsoft.Json;
    using Plexus.Channels;
    using Plexus.Interop.Transport;
    using Plexus.Processes;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;

    internal sealed class AppLifecycleManager : ProcessBase, IAppLifecycleManager, Generated.AppLifecycleManagerClient.IAppLifecycleServiceImpl
    {        
        private readonly Dictionary<UniqueId, IAppConnection> _connections
            = new Dictionary<UniqueId, IAppConnection>();

        private readonly Dictionary<(UniqueId AppInstanceId, string AppId), List<IAppConnection>> _appInstanceConnections
            = new Dictionary<(UniqueId, string), List<IAppConnection>>();

        private readonly Dictionary<string, List<IAppConnection>> _appConnections
            = new Dictionary<string, List<IAppConnection>>();

        private readonly Dictionary<(UniqueId AppInstanceId, string AppId), Promise<IAppConnection>> _appInstanceConnectionsInProgress
            = new Dictionary<(UniqueId, string), Promise<IAppConnection>>();

        private readonly HashSet<IWritableChannel<Generated.AppLifecycleEvent>> _appLifecycleEventSubscribers =
            new HashSet<IWritableChannel<Generated.AppLifecycleEvent>>();

        private readonly IAppRegistryProvider _appRegistryProvider;

        private readonly Generated.IAppLifecycleManagerClient _client;
        private readonly JsonSerializer _jsonSerializer = JsonSerializer.CreateDefault();
        private readonly NativeAppLauncherClient _nativeAppLauncherClient;

        public AppLifecycleManager(string metadataDir)
        {
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir, _jsonSerializer);
            _appRegistryProvider = JsonFileAppRegistryProvider.Initialize(Path.Combine(metadataDir, "apps.json"));
            _client = new Generated.AppLifecycleManagerClient(
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
                var deferredConnectionKey = (clientConnection.Info.ApplicationInstanceId, clientConnection.Info.ApplicationId);
                if (!_appInstanceConnections.TryGetValue(deferredConnectionKey, out var connectionList))
                {
                    connectionList = new List<IAppConnection>();
                    _appInstanceConnections[deferredConnectionKey] = connectionList;
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

                BroadcastEvent(new Generated.AppLifecycleEvent
                {
                    Connected = new Generated.AppConnectedEvent
                    {
                        ConnectionDescriptor = connectionInfo.ToProto()
                    }
                });

                if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out var waiter))
                {
                    Log.Debug("Resolving deferred connection {{{0}}} to accepted connection {{{1}}}", deferredConnectionKey, connection);
                    waiter.TryComplete(clientConnection);
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }

                return clientConnection;
            }
        }

        public void RemoveConnection(IAppConnection connection)
        {
            Log.Debug("Removing connection {0}", connection.Info);

            lock (_connections)
            {                
                _connections.Remove(connection.Id);

                var deferredConnectionKey = (connection.Info.ApplicationInstanceId, connection.Info.ApplicationId);
                if (_appInstanceConnections.TryGetValue(deferredConnectionKey, out var list))
                {
                    list.Remove(connection);
                    if (list.Count == 0)
                    {
                        _appInstanceConnections.Remove(deferredConnectionKey);
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

                if (_appInstanceConnectionsInProgress.TryGetValue(deferredConnectionKey, out var waiter))
                {
                    waiter.TryCancel();
                    _appInstanceConnectionsInProgress.Remove(deferredConnectionKey);
                }
            }

            BroadcastEvent(new Generated.AppLifecycleEvent
            {
                Disconnected = new Generated.AppDisconnectedEvent
                {
                    ConnectionDescriptor = connection.Info.ToProto()
                }
            });
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

        public async Task<ResolvedConnection> ResolveConnectionAsync(string appId, ResolveMode mode, AppConnectionDescriptor referrerConnectionInfo)
        {
            Log.Debug("Resolving connection for app {0} with mode {1} by request from {{{2}}}", appId, mode, referrerConnectionInfo);
            Task<IAppConnection> connectionTask;
            UniqueId suggestedInstanceId;
            lock (_connections)
            {
                if (mode == ResolveMode.SingleInstance &&
                    _appConnections.TryGetValue(appId, out var appConnectionList) &&
                    appConnectionList.Any())
                {
                    var connection = appConnectionList.First();
                    Log.Debug("Resolved connection for app {0} with mode {1} to online instance {{{2}}}",
                        appId, mode, connection);
                    return new ResolvedConnection(connection, false);
                }

                suggestedInstanceId = UniqueId.Generate();
                Log.Debug("Resolving connection for app {0} with mode {1} to new instance with suggested id {2}",
                    appId, mode, suggestedInstanceId);
                connectionTask = LaunchAndWaitConnectionAsync(appId, suggestedInstanceId, mode, referrerConnectionInfo);
            }
            var resolvedConnection = await connectionTask.ConfigureAwait(false);
            Log.Debug("Resolved connection for app {0} with mode {1} to launched instance {{{2}}} by request from {{{3}}}", 
                appId, mode, resolvedConnection, referrerConnectionInfo);
            return new ResolvedConnection(resolvedConnection, suggestedInstanceId == resolvedConnection.Id);
        }
        
        public IReadOnlyCollection<IAppConnection> GetOnlineConnections()
        {
            lock (_connections)
            {
                return _connections.Values.ToList();
            }
        }

        async Task<Generated.ResolveAppResponse> Generated.AppLifecycleService.IResolveAppImpl.ResolveApp(
            Generated.ResolveAppRequest request, MethodCallContext context)
        {
            Log.Info("Resolving app by request {{{0}}} from {{{1}}}", request, context);
            var referrerConnectionInfo = new AppConnectionDescriptor(
                context.ConsumerConnectionId, 
                context.ConsumerApplicationId,
                context.ConsumerApplicationInstanceId);
            var resolvedConnection = await ResolveConnectionAsync(
                request.AppId, Convert(request.AppResolveMode),referrerConnectionInfo).ConfigureAwait(false);
            var info = resolvedConnection.AppConnection.Info;
            Log.Info("App connection {{{0}}} resolved by request from {{{1}}}", resolvedConnection, context);
            var response = new Generated.ResolveAppResponse
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
        
        Task Generated.AppLifecycleService.IGetLifecycleEventStreamImpl.GetLifecycleEventStream(
            Empty request, IWritableChannel<Generated.AppLifecycleEvent> responseStream, MethodCallContext context)
        {            
            lock (_appLifecycleEventSubscribers)
            {
                _appLifecycleEventSubscribers.Add(responseStream);
            }
            Log.Info("Lifecycle events subscriber added: {{{0}}}", context);
            using (context.CancellationToken.Register(() =>
            {
                lock (_appLifecycleEventSubscribers)
                {
                    _appLifecycleEventSubscribers.Remove(responseStream);
                }
                Log.Info("Lifecycle events subscriber removed: {{{0}}}", context);
            }))
            {
            }
            return TaskConstants.Infinite;
        }

        private void BroadcastEvent(Generated.AppLifecycleEvent evt)
        {
            IWritableChannel<Generated.AppLifecycleEvent>[] subscribers;
            lock (_appLifecycleEventSubscribers)
            {
                subscribers = _appLifecycleEventSubscribers.ToArray();
            }
            if (subscribers.Length > 0)
            {
                TaskRunner.RunInBackground(
                    () => BroadcastEventAsync(evt, subscribers),
                    CancellationToken);
            }
            try
            {
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception while broadcasting lifecycle event");
            }
        }

        private async Task BroadcastEventAsync(
            Generated.AppLifecycleEvent evt,
            IReadOnlyCollection<IWritableChannel<Generated.AppLifecycleEvent>> subscribers)
        {            
            try
            {
                Log.Info("Broadcasting event to {0} subscribers: {1}", subscribers.Count, evt);
                await Task
                    .WhenAll(subscribers.Select(x =>
                        x.TryWriteAsync(evt, CancellationToken).IgnoreCancellation(CancellationToken)))
                    .ConfigureAwait(false);
                Log.Info("Event broadcasted to {0} subscribers: {1}", subscribers.Count, evt);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception while broadcasting lifecycle event");
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
                    if (_appInstanceConnections.TryGetValue(deferredConnectionKey, out var connectionList) && connectionList.Any())
                    {
                        var existingConnection = connectionList.First();
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

            var launchMethodReference =
                ProvidedMethodReference.Create("interop.AppLauncherService", "Launch", appDto.LauncherId);

            var referrer = new Generated.AppLaunchReferrer
            {
                AppId = referrerConnectionInfo.ApplicationId,
                AppInstanceId = referrerConnectionInfo.ApplicationInstanceId.ToProto(),
                ConnectionId = referrerConnectionInfo.ConnectionId.ToProto()
            };

            var request = new Generated.AppLaunchRequest
            {
                AppId = appId,
                LaunchParamsJson = appDto.LauncherParams.ToString(),
                SuggestedAppInstanceId = suggestedAppInstanceId.ToProto(),
                LaunchMode = Convert(resolveMode),
                Referrer = referrer
            };

            var response = await _client.CallInvoker
                .CallUnary<Generated.AppLaunchRequest, Generated.AppLaunchResponse>(launchMethodReference.CallDescriptor, request)
                .ConfigureAwait(false);

            var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);

            Log.Info("Received launch response for app {0} from {1}: {2}", appId, appDto.LauncherId, response);

            return appInstanceId;
        }

        private static ResolveMode Convert(Generated.AppLaunchMode launchMode)
        {
            switch (launchMode)
            {
                case Generated.AppLaunchMode.SingleInstance:
                    return ResolveMode.SingleInstance;
                case Generated.AppLaunchMode.MultiInstance:
                    return ResolveMode.MultiInstance;
                default:
                    throw new ArgumentOutOfRangeException(nameof(launchMode), launchMode, null);
            }
        }

        private static Generated.AppLaunchMode Convert(ResolveMode resolveMode)
        {
            switch (resolveMode)
            {
                case ResolveMode.SingleInstance:
                    return Generated.AppLaunchMode.SingleInstance;
                case ResolveMode.MultiInstance:
                    return Generated.AppLaunchMode.MultiInstance;
                default:
                    throw new ArgumentOutOfRangeException(nameof(resolveMode), resolveMode, null);
            }
        }
    }
}
