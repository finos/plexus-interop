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
namespace Plexus.Interop.Apps.Internal.Services
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
    using Plexus.Interop.Apps.Internal.Generated;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;

    internal class AppLifecycleServiceImpl : IAppLifecycleService
    {
        private ILogger Log { get; } = LogManager.GetLogger<AppLifecycleServiceImpl>();

        private readonly IAppLifecycleManager _appLifecycleManager;

        private readonly EventBroadcaster<AppLifecycleEvent> _appLifecycleEventBroadcaster
            = new EventBroadcaster<AppLifecycleEvent>();

        private readonly EventBroadcaster<InvocationEvent> _invocationEventBroadcaster
            = new EventBroadcaster<InvocationEvent>();

        public AppLifecycleServiceImpl(IAppLifecycleManager appLifecycleManager)
        {
            _appLifecycleManager = appLifecycleManager;
            _appLifecycleManager.ConnectionEventsStream.Subscribe(BroadcastConnectionEvents);
        }

        public void OnInvocationStarted(InvocationStartedEventDescriptor eventData)
        {
            _invocationEventBroadcaster.BroadcastEvent(new InvocationEvent
            {
                InvocationStarted = new InvocationStartedEvent
                {
                    InvocationDescriptor = eventData.InvocationDescriptor.ToProto()
                }
            });
        }

        public void OnInvocationFinished(InvocationFinishedEventDescriptor eventData)
        {
            _invocationEventBroadcaster.BroadcastEvent(new InvocationEvent
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
            if (connectionEvent.Type == ConnectionEventType.AppConnected)
            {
                lifecycleEvent.Connected = new AppConnectedEvent
                {
                    ConnectionDescriptor = connectionEvent.Connection.ToProto()
                };
            }
            else
            {
                lifecycleEvent.Disconnected = new AppDisconnectedEvent
                {
                    ConnectionDescriptor = connectionEvent.Connection.ToProto()
                };
            }
            _appLifecycleEventBroadcaster.BroadcastEvent(lifecycleEvent);
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
            return _appLifecycleEventBroadcaster.Subscribe(responseStream, context);
        }

        public Task GetInvocationEventStream(Empty request, IWritableChannel<InvocationEvent> responseStream, MethodCallContext context)
        {
            return _invocationEventBroadcaster.Subscribe(responseStream, context);
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
    }
}
