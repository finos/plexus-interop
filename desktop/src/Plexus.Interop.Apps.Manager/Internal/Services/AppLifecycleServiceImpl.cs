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
namespace Plexus.Interop.Apps.Internal.Services
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reactive.Concurrency;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
    using Plexus.Interop.Apps.Internal.Generated;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;
    using UniqueId = Plexus.UniqueId;

    internal class AppLifecycleServiceImpl : IAppLifecycleService
    {
        private ILogger Log { get; } = LogManager.GetLogger<AppLifecycleServiceImpl>();

        private readonly IAppLifecycleManager _appLifecycleManager;

        private readonly Subject<AppLifecycleEvent> _appLifecycleEventBroadcaster
            = new Subject<AppLifecycleEvent>();

        private readonly Subject<InvocationEvent> _invocationEventBroadcaster
            = new Subject<InvocationEvent>();

        public AppLifecycleServiceImpl(IAppLifecycleManager appLifecycleManager)
        {
            _appLifecycleManager = appLifecycleManager;
            _appLifecycleManager.ConnectionEventsStream.Subscribe(BroadcastConnectionEvents);
        }

        public void OnInvocationStarted(InvocationStartedEventDescriptor eventData)
        {
            _invocationEventBroadcaster.OnNext(new InvocationEvent
            {
                InvocationStarted = new InvocationStartedEvent
                {
                    InvocationDescriptor = eventData.InvocationDescriptor.ToProto()
                }
            });
        }

        public void OnInvocationFinished(InvocationFinishedEventDescriptor eventData)
        {
            _invocationEventBroadcaster.OnNext(new InvocationEvent
            {
                InvocationFinished = new InvocationFinishedEvent
                {
                    InvocationDescriptor = eventData.MethodCallDescriptor.ToProto(),
                    Result = eventData.Result.ToProto(),
                    DurationMs = eventData.DurationMs
                }
            });
        }

        private void BroadcastConnectionEvents(AppConnectionEvent connectionEvent)
        {
            var lifecycleEvent = new AppLifecycleEvent();
            switch (connectionEvent.Type)
            {
                case ConnectionEventType.AppConnected:
                    lifecycleEvent.Connected = new AppConnectedEvent
                    {
                        ConnectionDescriptor = connectionEvent.Connection.ToProto()
                    };
                    break;
                case ConnectionEventType.AppDisconnected:
                    lifecycleEvent.Disconnected = new AppDisconnectedEvent
                    {
                        ConnectionDescriptor = connectionEvent.Connection.ToProto()
                    };
                    break;
                case ConnectionEventType.AppConnectionError:
                    lifecycleEvent.Error = new AppConnectionErrorEvent
                    {
                        ConnectionDescriptor = connectionEvent.Connection.ToProto()
                    };
                    break;
                default:
                    Log.Error($"Unknown connection event type {connectionEvent.Type}");
                    return;
            };
            _appLifecycleEventBroadcaster.OnNext(lifecycleEvent);
        }

        public async Task<ResolveAppResponse> ResolveApp(ResolveAppRequest request, MethodCallContext context)
        {
            Log.Info("Resolving app by request {{{0}}} from {{{1}}}", request, context);
            var referrerConnectionInfo = new AppConnectionDescriptor(
                context.ConsumerConnectionId,
                context.ConsumerApplicationId,
                context.ConsumerApplicationInstanceId);
            var resolveMode = Convert(request.AppResolveMode);
            if (resolveMode == ResolveMode.SingleInstance)
            {
                var connection = _appLifecycleManager.GetOnlineConnections().FirstOrDefault(c => c.Info.ApplicationId.Equals(request.AppId));
                Log.Debug("Resolved connection for app {0} with mode {1} to online instance {{{2}}}", connection, resolveMode, connection);
                if (connection != null)
                {
                    return new ResolveAppResponse
                    {
                        AppInstanceId = connection.Info.ApplicationInstanceId.ToProto(),
                        AppConnectionId = connection.Info.ConnectionId.ToProto(),
                        IsNewInstanceLaunched = false,
                    };
                }
            }

            var resolvedConnection = await _appLifecycleManager.LaunchAndConnectAsync(
                request.AppId, resolveMode, referrerConnectionInfo).ConfigureAwait(false);
            var info = resolvedConnection.AppConnection.Info;
            Log.Info("App connection {{{0}}} resolved by request from {{{1}}}", resolvedConnection, context);
            var response = new ResolveAppResponse
            {
                AppConnectionId = info.ConnectionId.ToProto(),
                AppInstanceId = info.ApplicationInstanceId.ToProto(),
                IsNewInstanceLaunched = resolvedConnection.IsNewInstance
            };
            return response;
        }

        public Task GetLifecycleEventStream(Empty request, IWritableChannel<AppLifecycleEvent> responseStream, MethodCallContext context)
        {
            return _appLifecycleEventBroadcaster.ObserveOn(TaskPoolScheduler.Default).PipeAsync(responseStream, context.CancellationToken);
        }

        public Task GetInvocationEventStream(Empty request, IWritableChannel<InvocationEvent> responseStream, MethodCallContext context)
        {
            return _invocationEventBroadcaster.ObserveOn(TaskPoolScheduler.Default).PipeAsync(responseStream, context.CancellationToken);
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

        public Task<GetConnectionsResponse> GetConnections(GetConnectionsRequest request, MethodCallContext context)
        {
            var response = CreateConnectionsResponse(GetOnlineConnections(request));
            if (response.Connections.Count == 0 && IsSingleConnectionRequest(request))
            {
                if (IsSpecificConnectionId(request, out var connectionId))
                {
                    throw new InvalidOperationException($"No connection with {connectionId} is found");
                }

                if (IsSpecificAppIdWithInstanceId(request, out var appId, out var appInstanceId))
                {
                    throw new InvalidOperationException($"No connection with for {appInstanceId} application instance id with {appId} app id is found");
                }
            }

            return Task.FromResult(response);
        }

        public async Task GetConnectionsStream(GetConnectionsRequest request, IWritableChannel<GetConnectionsEvent> responseStream, MethodCallContext context)
        {
            await _appLifecycleManager.ConnectionEventsStream
                .Where(e => IsEventFitRequest(request, e.Connection))
                .Select(e => CreateGetConnectionsEvent(request, e))
                .Where(e => e != null)
                .StartWith(CreateInitialGetConnectionsEvent(request))
                .PipeAsync(responseStream);
        }

        private GetConnectionsEvent CreateInitialGetConnectionsEvent(GetConnectionsRequest request)
        {
            return new GetConnectionsEvent()
            {
                Connections = { GetOnlineConnections(request).Select(c => c.Info.ToProto()) }
            };
        }

        private GetConnectionsEvent CreateGetConnectionsEvent(GetConnectionsRequest request, AppConnectionEvent appConnectionEvent)
        {
            var response = CreateInitialGetConnectionsEvent(request);
            switch (appConnectionEvent.Type)
            {
                case ConnectionEventType.AppConnected:
                    response.NewConnection = appConnectionEvent.Connection.ToProto();
                    return response;
                case ConnectionEventType.AppDisconnected:
                    response.ClosedConnection = appConnectionEvent.Connection.ToProto();
                    return response;
                default:
                    return null;
            }
        }

        private static bool IsEventFitRequest(GetConnectionsRequest request, AppConnectionDescriptor connection)
        {
            var connectionId = request.ConnectionId.ToUniqueId();
            if (connectionId != UniqueId.Empty)
            {
                return connectionId.Equals(connection.ConnectionId);
            }
            var appId = request.ApplicationId;
            var appInstanceId = request.AppInstanceId.ToUniqueId();

            if (appInstanceId != UniqueId.Empty && !connection.ApplicationInstanceId.Equals(appInstanceId))
            {
                return false;
            }

            if (!string.IsNullOrEmpty(appId) && !connection.ApplicationId.Equals(appId))
            {
                return false;
            }

            return true;
        }

        private static bool IsSingleConnectionRequest(GetConnectionsRequest request)
        {
            return IsSpecificConnectionId(request, out _) || IsSpecificAppIdWithInstanceId(request, out _, out _);
        }

        private static bool IsSpecificConnectionId(GetConnectionsRequest request, out UniqueId connectionId)
        {
            connectionId = request.ConnectionId.ToUniqueId();
            var isSpecificConnectionId = connectionId != UniqueId.Empty;
            return isSpecificConnectionId;
        }

        private static bool IsSpecificAppIdWithInstanceId(GetConnectionsRequest request, out string appId, out UniqueId appInstanceId)
        {
            appId = request.ApplicationId;
            appInstanceId = request.AppInstanceId.ToUniqueId();
            var isSpecificAppIdWithInstanceId = !string.IsNullOrEmpty(appId) && appInstanceId != UniqueId.Empty;
            return isSpecificAppIdWithInstanceId;
        }

        private IEnumerable<IAppConnection> GetOnlineConnections(GetConnectionsRequest request)
        {
            var connectionId = request.ConnectionId.ToUniqueId();
            if (connectionId != UniqueId.Empty)
            {
                if (_appLifecycleManager.TryGetOnlineConnection(connectionId, out var connectionInfo))
                {
                    return new[] { connectionInfo };
                }
                return Enumerable.Empty<IAppConnection>();
            }

            var appId = request.ApplicationId;
            var appInstanceId = request.AppInstanceId.ToUniqueId();

            if (appInstanceId != UniqueId.Empty)
            {
                if (!string.IsNullOrEmpty(appId))
                {
                    if (_appLifecycleManager.TryGetOnlineConnection(appInstanceId, appId, out var connection))
                    {
                        return new[] { connection };
                    }
                }
                return _appLifecycleManager.GetAppInstanceConnections(appInstanceId);
            }

            if (!string.IsNullOrEmpty(appId))
            {
                return _appLifecycleManager.GetAppConnections(appId);
            }

            return _appLifecycleManager.GetOnlineConnections();
        }

        private static GetConnectionsResponse CreateConnectionsResponse(IEnumerable<IAppConnection> connectionDescriptors)
        {
            return new GetConnectionsResponse()
            {
                Connections = { connectionDescriptors.Select(descriptor => descriptor.Info.ToProto()) }
            };
        }
    }
}
