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
    using System.Diagnostics;
    using System.Linq;
    using System.Reactive;
    using System.Reactive.Concurrency;
    using System.Reactive.Linq;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Apps.Internal.Services.ContextLinkage;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;
    using Context = Plexus.Interop.Apps.Internal.Services.ContextLinkage.Context;
    using ContextDto = Generated.Context;
    using UniqueId = Plexus.UniqueId;

    internal class ContextLinkageServiceImpl : AppLifecycleManagerClient.IContextLinkageServiceImpl, IContextLinkageManager
    {
        private ILogger Log { get; } = LogManager.GetLogger<ContextLinkageServiceImpl>();

        private readonly IRegistryProvider _appRegistryProvider;
        private readonly IAppLifecycleManager _appLifecycleManager;
        private readonly ContextsSet _contextsSet;

        public ContextLinkageServiceImpl(IRegistryProvider appRegistryProvider, IAppLifecycleManager appLifecycleManager, IAppLaunchedEventProvider appLaunchedEventProvider)
        {
            _appRegistryProvider = appRegistryProvider;
            _appLifecycleManager = appLifecycleManager;
            _contextsSet = new ContextsSet(appLifecycleManager);

            appLaunchedEventProvider.AppLaunchedStream.Subscribe(OnAppLaunched);
            appLifecycleManager.ConnectionEventsStream.Subscribe(OnAppConnectedOrDisconnected);
        }

        public Task<ContextDto> CreateContext(Empty request, MethodCallContext callContext)
        {
            return Task.Factory.StartNew(() =>
            {
                var newContext = _contextsSet.CreateContext();
                foreach (var appConnection in _appLifecycleManager.GetAppInstanceConnections(callContext.ConsumerApplicationInstanceId))
                {
                    newContext.AppConnected(appConnection.Info);
                }
                return new ContextDto { Id = newContext.Id };
            });
        }

        private void OnAppLaunched(AppLaunchedEvent appLaunchedEvent)
        {
            if (appLaunchedEvent.AppIds.Count == 0)
            {
                return;
            }

            var refererAppContexts = _contextsSet.GetContextsOf(appLaunchedEvent.Referrer.AppInstanceId.ToUniqueId());

            if (!refererAppContexts.Any())
            {
                return;
            }

            var appInstanceId = appLaunchedEvent.AppInstanceId.ToUniqueId();

            foreach (var refererContext in refererAppContexts)
            {
                refererContext.AppLaunched(appInstanceId, appLaunchedEvent.AppIds);
            }
        }

        private void OnAppConnectedOrDisconnected(AppConnectionEvent connectionEvent)
        {
            var connection = connectionEvent.Connection;
            var contextsOfApp = _contextsSet.GetContextsOf(connection.ApplicationInstanceId);
            foreach (var context in contextsOfApp)
            {
                switch (connectionEvent.Type)
                {
                    case ConnectionEventType.AppConnected:
                        context.AppConnected(connection);
                        break;
                    case ConnectionEventType.AppDisconnected:
                        context.AppDisconnected(connection);
                        break;
                }
            }
        }

        public Task<Empty> JoinContext(ContextDto request, MethodCallContext callContext)
        {
            return Task.Factory.StartNew(() =>
            {
                var context = _contextsSet.GetContext(request.Id);
                if (context == null)
                {
                    throw new Exception($"There is no context with {request.Id} id");
                }
                foreach (var appConnection in _appLifecycleManager.GetAppInstanceConnections(callContext.ConsumerApplicationInstanceId))
                {
                    context.AppConnected(appConnection.Info);
                }
                return new Empty();
            });
        }

        public Task<ContextsList> GetContexts(Empty request, MethodCallContext callContext)
        {
            return Task.Factory.StartNew(() =>
            {
                var allContexts = _contextsSet.GetContextsOf(callContext.ConsumerApplicationInstanceId);
                return new ContextsList
                {
                    Contexts = { allContexts.Select(context => new ContextDto { Id = context.Id }) }
                };
            });
        }

        public Task<InvocationsList> GetLinkedInvocations(ContextDto request, MethodCallContext callContext)
        {
            return Task.Factory.StartNew(() =>
            {
                var context = _contextsSet.GetContext(request.Id);
                if (context == null)
                {
                    throw new Exception($"There is no context with {request.Id} id");
                }

                return CreateInvocationsList(context);
            });
        }

        public Task<ContextToInvocationsList> GetAllLinkedInvocations(Empty request, MethodCallContext callContext)
        {
            return Task.Factory.StartNew(() =>
            {
                var allContexts = _contextsSet.GetAllContexts();
                return new ContextToInvocationsList
                {
                    Contexts = { allContexts.Select(context => new ContextToInvocations
                    {
                        Context = new ContextDto {Id = context.Id},
                        Invocations = CreateInvocationsList(context),
                    })}
                };
            });
        }

        public async Task ContextLoadedStream(ContextDto request, IWritableChannel<ContextLoadingUpdate> responseStream, MethodCallContext callContext)
        {
            var context = _contextsSet.GetContext(request.Id);
            if (context == null)
            {
                throw new Exception($"There is no context with {request.Id} id");
            }

            await Observable.Return(Unit.Default)
                .Merge(context.ContextUpdatedEventStream)
                .ObserveOn(TaskPoolScheduler.Default)
                .Throttle(TimeSpan.FromMilliseconds(200))
                .Select(_ => new ContextLoadingUpdate
                {
                    LoadedAppDescriptors =
                    {
                        context.GetConnectedApps().Select(ConvertToProto)
                    },
                    Status = context.IsLoading ? ContextLoadingStatus.InProgress : ContextLoadingStatus.Finished,
                })
                .DistinctUntilChanged()
                .Do(update =>
                {
                    Log.Debug(
                        $"Sending context linkage update for context {context.Id}: LoadedAppDescriptorsCount={update.LoadedAppDescriptors.Count}");
                })
                .PipeAsync(responseStream, callContext.CancellationToken);
        }

        private InvocationsList CreateInvocationsList(Context context)
        {
            return new InvocationsList
            {
                Invocations =
                {
                    context.GetConnectedApps().Select(connection => new InvocationRef
                    {
                        Target = ConvertToProto(connection),
                        AppInfo = GetAppInfo(connection.ApplicationId),
                    })
                }
            };
        }

        private static Generated.AppConnectionDescriptor ConvertToProto(AppConnectionDescriptor connection)
        {
            return new Generated.AppConnectionDescriptor
            {
                AppInstanceId = connection.ApplicationInstanceId.ToProto(),
                AppId = connection.ApplicationId,
                ConnectionId = connection.ConnectionId.ToProto(),
            };
        }

        private AppMetamodelInfo GetAppInfo(string appId)
        {
            var appInfo = _appRegistryProvider.Current.Applications[appId];
            return AppMetadataServiceImpl.ConvertToAppMetamodelInfo(appInfo);
        }

        public bool IsContextShouldBeConsidered(IContextLinkageOptions contextLinkageOptions, IAppConnection sourceConnection)
        {
            return contextLinkageOptions != null
                   && contextLinkageOptions.Mode != ContextLinkageDiscoveryMode.None
                   && GetApplicationContexts(contextLinkageOptions, sourceConnection).Any();
        }

        public IReadOnlyCollection<(UniqueId AppInstanceId, string AppId, Maybe<UniqueId> ConnectionId)> GetAppsInContexts(IContextLinkageOptions contextLinkageOptions, IAppConnection sourceConnection, bool online)
        {
            return GetApplicationContexts(contextLinkageOptions, sourceConnection)
                .Select(id => _contextsSet.GetContext(id))
                .Where(context => context != null)
                .SelectMany(context => context.GetAppsInContext(online))
                .Distinct().ToArray();
        }

        private IReadOnlyCollection<string> GetApplicationContexts(IContextLinkageOptions contextLinkageOptions, IAppConnection sourceConnection)
        {
            switch (contextLinkageOptions.Mode)
            {
                case ContextLinkageDiscoveryMode.CurrentContext:
                    return _contextsSet.GetContextsOf(sourceConnection.Info.ApplicationInstanceId)
                        .Select(context => context.Id).ToArray();
                case ContextLinkageDiscoveryMode.SpecificContext when contextLinkageOptions.SpecificContext.HasValue:
                    return new[] { contextLinkageOptions.SpecificContext.Value };
                default:
                    return new string[0];
            }
        }

        public Task AppJoinedContextStream(Empty request, IWritableChannel<AppJoinedContextEvent> responseStream, MethodCallContext context)
        {
            return _contextsSet.AppContextBindingEvents
                .Select(ev => new AppJoinedContextEvent
                {
                    AppInstanceId = ev.AppInstanceId.ToProto(),
                    Context = new ContextDto { Id = ev.Context.Id }
                })
                .PipeAsync(responseStream, context.CancellationToken);
        }

        public Task<RestoreContextsLinkageResponse> RestoreContextsLinkage(RestoreContextsLinkageRequest request, MethodCallContext callContext)
        {
            return Task.Factory.StartNew(() =>
            {
                var newCreatedContexts = new Dictionary<string, Context>();
                foreach (var restoringAppInstance in request.Apps)
                {
                    foreach (var contextId in restoringAppInstance.ContextIds)
                    {
                        if (!newCreatedContexts.TryGetValue(contextId, out var context))
                        {
                            context = _contextsSet.CreateContext();
                            newCreatedContexts[contextId] = context;
                        }

                        context.AppLaunched(restoringAppInstance.AppInstanceId.ToUniqueId(),
                            restoringAppInstance.AppIds);
                    }
                }

                var response = new RestoreContextsLinkageResponse();
                foreach (var pair in newCreatedContexts)
                {
                    response.CreatedContextsMap[pair.Key] = new ContextDto { Id = pair.Value.Id };
                }
                return response;
            });
        }
    }
}
