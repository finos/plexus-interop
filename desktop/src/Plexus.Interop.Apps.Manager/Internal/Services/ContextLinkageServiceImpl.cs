namespace Plexus.Interop.Apps.Internal.Services
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
    using Plexus.Interop.Apps.Internal.Generated;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;
    using UniqueId = Plexus.UniqueId;

    internal class ContextLinkageServiceImpl : AppLifecycleManagerClient.IContextLinkageServiceImpl
    {
        public ContextLinkageServiceImpl(IAppLifecycleManager appLifecycleManager)
        {
            appLifecycleManager.AppLaunchedAndConnected += OnAppLaunchedAndConnected;
            appLifecycleManager.AppConnected += OnAppConnected;
        }

        private readonly ConcurrentDictionary<UniqueId, ConcurrentSet<string>> _contextsOfApp = new ConcurrentDictionary<UniqueId, ConcurrentSet<string>>();
        private readonly ConcurrentDictionary<UniqueId, ConcurrentSet<AppConnectionDescriptor>> _connectionsOfApp = new ConcurrentDictionary<UniqueId, ConcurrentSet<AppConnectionDescriptor>>();

        private void OnAppLaunchedAndConnected(AppLaunchedAndConnected newApplicationInfo)
        {
            foreach (var refererContextId in GetContextOfApplication(newApplicationInfo.ReferrerConnectionInfo.ApplicationInstanceId))
            {
                SetContextIdForApp(newApplicationInfo.AppInstanceId, refererContextId);
            }
        }

        private void OnAppConnected(AppConnectionDescriptor obj)
        {

        }

        public Task ContextLoadedStream(Context request, IWritableChannel<ContextLoadingUpdate> responseStream, MethodCallContext context)
        {
            throw new NotImplementedException();
        }

        public Task<Context> CreateContext(Empty request, MethodCallContext context)
        {
            return Task.Factory.StartNew(() =>
            {
                var newContextId = Guid.NewGuid().ToString();
                SetContextIdForApp(context.ConsumerApplicationInstanceId, newContextId);
                return new Context { Id = newContextId };
            });
        }

        public Task<Empty> JoinContext(Context request, MethodCallContext context)
        {
            return Task.Factory.StartNew(() =>
            {
                SetContextIdForApp(context.ConsumerApplicationInstanceId, request.Id);
                return new Empty();
            });
        }

        public Task<Empty> AttachApplicationToContext(AttachRequest request, MethodCallContext context)
        {
            return Task.Factory.StartNew(() =>
            {
                SetContextIdForApp(request.AppInstanceId.ToUniqueId(), request.Context.Id);
                return new Empty();
            });
        }

        public Task<ContextsList> GetContexts(Empty request, MethodCallContext context)
        {
            return Task.Factory.StartNew(() =>
            {
                var allContexts = new HashSet<string>(_contextsOfApp.Values.SelectMany(set => set.AsEnumerable()));
                return new ContextsList
                {
                    Contexts = { allContexts.Select(contextId => new Context { Id = contextId }) }
                };
            });
        }

        public Task<InvocationsList> GetLinkedInvocations(Context request, MethodCallContext context)
        {
            return Task.Factory.StartNew(() =>
            {
                var allAppsInContext = _contextsOfApp.Where(pair => pair.Value.Contains(request.Id)).Select(pair => pair.Key);
                var allConnectionsOfApps = allAppsInContext.SelectMany(GetConnectionsOfApp);
                return new InvocationsList
                {
                    Invocations = { allConnectionsOfApps.Select(appConnection  => new InvocationRef
                    {
                        Target = new Generated.AppConnectionDescriptor
                        {
                            AppInstanceId = appConnection.ApplicationInstanceId.ToProto(),
                            AppId = appConnection.ApplicationId,
                            ConnectionId = appConnection.ConnectionId.ToProto(),
                        },
                        
                    })}
                };
            });
        }

        public Task<ContextToInvocationsList> GetAllLinkedInvocations(Empty request, MethodCallContext context)
        {
            throw new NotImplementedException();
        }

        private void SetContextIdForApp(UniqueId appInstanceId, string contextId)
        {
            _contextsOfApp.AddOrUpdate(appInstanceId, s => new ConcurrentSet<string> { contextId }, (s, bag) =>
            {
                bag.Add(contextId);
                return bag;
            });
        }

        private IEnumerable<string> GetContextOfApplication(UniqueId appInstanceId)
        {
            if (_contextsOfApp.TryGetValue(appInstanceId, out var contexts))
            {
                return contexts.Select(i => i.ToString()).ToList();
            }
            return Enumerable.Empty<string>();
        }

        private IEnumerable<AppConnectionDescriptor> GetConnectionsOfApp(UniqueId appInstanceId)
        {
            if (_connectionsOfApp.TryGetValue(appInstanceId, out var connectionDescriptors))
            {
                return connectionDescriptors;
            }
            return Enumerable.Empty<AppConnectionDescriptor>();
        }
    }
}
