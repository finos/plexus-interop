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
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Metamodel;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;
    using ContextDto = Generated.Context;
    using UniqueId = Plexus.UniqueId;

    internal class ContextLinkageServiceImpl : AppLifecycleManagerClient.IContextLinkageServiceImpl
    {
        private readonly IRegistryProvider _appRegistryProvider;
        private readonly IAppLifecycleManager _appLifecycleManager;

        private readonly ContextsSet _contextsSet = new ContextsSet();

        public ContextLinkageServiceImpl(IRegistryProvider appRegistryProvider, IAppLifecycleManager appLifecycleManager)
        {
            _appRegistryProvider = appRegistryProvider;
            _appLifecycleManager = appLifecycleManager;
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

        public void OnAppLaunched(AppLaunchedEvent appLaunchedEvent)
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

        private class ContextsSet
        {
            public ContextsSet()
            {
                LoadingStatusChanged = _loadingStatusSubject;
            }

            private readonly Subject<Context> _loadingStatusSubject = new Subject<Context>();

            public IObservable<Context> LoadingStatusChanged { get; }

            public Context CreateContext()
            {
                var context = new Context(this);
                _contexts[context.Id] = context;
                context.IsLoadingStatus.Select(isLoading => context).Subscribe(_loadingStatusSubject);
                return context;
            }

            public IReadOnlyCollection<Context> GetContextsOf(UniqueId appInstanceId)
            {
                lock (_lock)
                {
                    if (_contextsOfAppInstance.TryGetValue(appInstanceId, out var contexts))
                    {
                        return contexts.ToArray();
                    }
                }
                return new Context[0];
            }

            private readonly object _lock = new object();

            private readonly Dictionary<UniqueId, HashSet<Context>> _contextsOfAppInstance = new Dictionary<UniqueId, HashSet<Context>>();
            private readonly Dictionary<string, Context> _contexts = new Dictionary<string, Context>();

            public Context GetContext(string contextId)
            {
                lock (_lock)
                {
                    _contexts.TryGetValue(contextId, out var context);
                    return context;
                }
            }

            public void BindContext(UniqueId appInstanceId, Context context)
            {
                lock (_lock)
                {
                    if (!_contextsOfAppInstance.TryGetValue(appInstanceId, out var contexts))
                    {
                        contexts = new HashSet<Context>();
                        _contextsOfAppInstance[appInstanceId] = contexts;
                    }
                    contexts.Add(context);
                }
            }

            public IReadOnlyCollection<Context> GetAllContexts()
            {
                lock (_lock)
                {
                    return _contexts.Values.ToArray();
                }
            }
        }

        private class Context
        {
            private readonly ContextsSet _contextsSet;

            public Context(ContextsSet contextsSet)
            {
                _contextsSet = contextsSet;
                IsLoadingStatus = _loadingStatusSubject.DistinctUntilChanged();
            }

            public string Id { get; } = Guid.NewGuid().ToString();

            private readonly object _lock = new object();

            private readonly HashSet<AppConnectionsSet> _loadingAppsSet = new HashSet<AppConnectionsSet>();
            private readonly Dictionary<UniqueId, AppConnectionsSet> _appInstanceIdsToConnections = new Dictionary<UniqueId, AppConnectionsSet>();

            private readonly BehaviorSubject<bool> _loadingStatusSubject = new BehaviorSubject<bool>(false);

            public IObservable<bool> IsLoadingStatus { get; }

            public bool IsLoading => _loadingStatusSubject.Value;

            public void AppLaunched(UniqueId appInstanceId, IEnumerable<string> appIds)
            {
                _contextsSet.BindContext(appInstanceId, this);
                var appConnectionsSet = GetOrCreateAppConnectionsSet(appInstanceId);
                appConnectionsSet.AppLaunched(appIds);
            }

            public void AppConnected(AppConnectionDescriptor appConnection)
            {
                _contextsSet.BindContext(appConnection.ApplicationInstanceId, this);
                var appConnectionsSet = GetOrCreateAppConnectionsSet(appConnection.ApplicationInstanceId);
                appConnectionsSet.AppConnected(appConnection);
            }

            public void AppDisconnected(AppConnectionDescriptor appConnection)
            {
                lock (_lock)
                {
                    if (_appInstanceIdsToConnections.TryGetValue(appConnection.ApplicationInstanceId, out var appConnectionsSet))
                    {
                        appConnectionsSet.AppDisconnected(appConnection);
                    }
                }
            }

            private AppConnectionsSet GetOrCreateAppConnectionsSet(UniqueId appInstanceId)
            {
                AppConnectionsSet appConnectionsSet;
                lock (_lock)
                {
                    if (!_appInstanceIdsToConnections.TryGetValue(appInstanceId, out appConnectionsSet))
                    {
                        appConnectionsSet = new AppConnectionsSet(appInstanceId);
                        appConnectionsSet.IsLoadingStatus.Subscribe(newStatus => AppConnectionsSetLoadingStatusChanged(appConnectionsSet, newStatus));
                        _appInstanceIdsToConnections[appInstanceId] = appConnectionsSet;
                    }
                }

                return appConnectionsSet;
            }

            private void AppConnectionsSetLoadingStatusChanged(AppConnectionsSet connectionSet, bool isLoading)
            {
                bool newLoadingStatus;
                lock (_lock)
                {
                    if (isLoading)
                    {
                        _loadingAppsSet.Add(connectionSet);
                    }
                    else
                    {
                        _loadingAppsSet.Remove(connectionSet);
                    }

                    newLoadingStatus = _loadingAppsSet.Count > 0;
                }

                _loadingStatusSubject.OnNext(newLoadingStatus);
            }

            public IReadOnlyCollection<AppConnectionDescriptor> GetConnectedApps()
            {
                lock (_lock)
                {
                    return _appInstanceIdsToConnections.Values.SelectMany(connections => connections.GetOnlineConnections()).ToArray();
                }
            }
        }

        private class AppConnectionsSet
        {
            private readonly UniqueId _appInstanceId;

            private readonly object _lock = new object();

            private readonly HashSet<string> _loadingApps = new HashSet<string>();
            private readonly Dictionary<string, AppConnectionDescriptor> _appConnectionMap = new Dictionary<string, AppConnectionDescriptor>();

            private readonly BehaviorSubject<bool> _loadingStatusSubject = new BehaviorSubject<bool>(false);

            public IObservable<bool> IsLoadingStatus { get; }

            public AppConnectionsSet(UniqueId appInstanceId)
            {
                _appInstanceId = appInstanceId;
                IsLoadingStatus = _loadingStatusSubject.DistinctUntilChanged();
            }

            public void AppLaunched(IEnumerable<string> appIds)
            {
                bool newLoadingStatus;
                lock (_lock)
                {
                    foreach (var appId in appIds)
                    {
                        if (!_appConnectionMap.ContainsKey(appId))
                        {
                            _loadingApps.Add(appId);
                        }
                    }

                    newLoadingStatus = _loadingApps.Count > 0;
                }

                _loadingStatusSubject.OnNext(newLoadingStatus);
            }

            public void AppConnected(AppConnectionDescriptor appConnection)
            {
                bool newLoadingStatus;
                lock (_lock)
                {
                    var appId = appConnection.ApplicationId;
                    _appConnectionMap[appId] = appConnection;
                    _loadingApps.Remove(appId);
                    newLoadingStatus = _loadingApps.Count > 0;
                }

                _loadingStatusSubject.OnNext(newLoadingStatus);
            }

            public void AppDisconnected(AppConnectionDescriptor appConnection)
            {
                bool newLoadingStatus;
                lock (_lock)
                {
                    var appId = appConnection.ApplicationId;
                    _appConnectionMap.Remove(appId);
                    _loadingApps.Remove(appId);
                    newLoadingStatus = _loadingApps.Count > 0;
                }

                _loadingStatusSubject.OnNext(newLoadingStatus);
            }

            public IReadOnlyCollection<AppConnectionDescriptor> GetOnlineConnections()
            {
                lock (_lock)
                {
                    return _appConnectionMap.Values.Where(descriptor => descriptor != null).ToArray();
                }
            }
        }
    }
}
