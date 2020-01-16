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
    using System.Collections.Generic;
    using System.Linq;
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
        private readonly IRegistryProvider _appRegistryProvider;
        private readonly IAppLifecycleManager _appLifecycleManager;

        private readonly ContextsSet _contextsSet = new ContextsSet();

        public ContextLinkageServiceImpl(IRegistryProvider appRegistryProvider, IAppLifecycleManager appLifecycleManager, IAppLaunchedEventProvider appLaunchedEventProvider)
        {
            _appRegistryProvider = appRegistryProvider;
            _appLifecycleManager = appLifecycleManager;

            appLaunchedEventProvider.AppLaunchedStream.Subscribe(OnAppLaunched);

            appLifecycleManager.AppConnected += OnAppConnected;
            appLifecycleManager.AppDisconnected += OnAppDisconnected;
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

            var appInstanceId = appLaunchedEvent.AppInstanceId.ToUniqueId();

            foreach (var refererContext in refererAppContexts)
            {
                refererContext.AppLaunched(appInstanceId, appLaunchedEvent.AppIds);
            }
        }

        private void OnAppConnected(AppConnectionDescriptor appConnection)
        {
            var contextsOfApp = _contextsSet.GetContextsOf(appConnection.ApplicationInstanceId);
            foreach (var context in contextsOfApp)
            {
                context.AppConnected(appConnection);
            }
        }

        private void OnAppDisconnected(AppConnectionDescriptor connectionDescriptor)
        {
            var contextsOfApp = _contextsSet.GetContextsOf(connectionDescriptor.ApplicationInstanceId);
            foreach (var context in contextsOfApp)
            {
                context.AppDisconnected(connectionDescriptor);
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
            await _contextsSet.LoadingStatusChanged
                .Select(context => new ContextLoadingUpdate
                {
                    LoadedAppDescriptors = { context.GetConnectedApps().Select(ConvertToProto) },
                    Status = context.IsLoading ? ContextLoadingStatus.InProgress : ContextLoadingStatus.Finished,
                }).PipeAsync(responseStream, callContext.CancellationToken);
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

        public class AppContextBindingEvent
        {
            public AppContextBindingEvent(Context context, UniqueId appInstanceId)
            {
                Context = context;
                AppInstanceId = appInstanceId;
            }

            public Context Context { get; }
            public UniqueId AppInstanceId { get; }
        }

        public IReadOnlyCollection<string> GetApplicationContexts(UniqueId applicationInstanceId)
        {
            return _contextsSet.GetContextsOf(applicationInstanceId).Select(context => context.Id).ToArray();
        }

        public IReadOnlyCollection<(UniqueId AppInstanceId, string AppId, Maybe<UniqueId> ConnectionId)> GetAppsInContexts(IEnumerable<string> contextIds, bool online)
        {
            return contextIds.Select(id => _contextsSet.GetContext(id)).Where(context => context != null)
                .SelectMany(context => context.GetAppsInContext(online)).Distinct().ToArray();
        }
    }
}
