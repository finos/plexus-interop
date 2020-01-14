namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Linq;
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Metamodel;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;
    using UniqueId = Plexus.UniqueId;

    internal class AppLaunchedEventProvider : IAppLaunchedEventProvider
    {
        private readonly IRegistryProvider _registryProvider;
        private readonly Lazy<IClient> _client;

        public AppLaunchedEventProvider(IAppLifecycleManager appLifecycleManager, IRegistryProvider registryProvider, Lazy<IClient> client)
        {
            _registryProvider = registryProvider;
            _client = client;
            appLifecycleManager.AppConnected += OnAppConnected;

            AppLaunchedStream = _appLaunchedSubject;
        }

        private readonly Subject<AppLaunchedEvent> _appLaunchedSubject = new Subject<AppLaunchedEvent>();

        private void OnAppConnected(AppConnectionDescriptor appConnectionDescriptor)
        {
            if (IsLauncher(appConnectionDescriptor, out var applicationId))
            {
                SubscribeToApplicationLaunchedEventStream(applicationId, appConnectionDescriptor.ConnectionId);
            }
        }

        private bool IsLauncher(AppConnectionDescriptor appConnectionDescriptor, out string applicationId)
        {
            applicationId = appConnectionDescriptor.ApplicationId;
            var isLauncherApplication = _registryProvider.Current.Applications[applicationId].ProvidedServices
                .Any(service => service.Service.Id == AppLauncherService.Id);
            return isLauncherApplication;
        }

        private void SubscribeToApplicationLaunchedEventStream(string applicationId, UniqueId connectionId)
        {
            var appLauncherServiceId = AppLauncherService.Id;
            var appLaunchedEventStreamMethodId = AppLauncherService.AppLaunchedEventStreamMethodId;
            var methodCallDescriptor = ProvidedMethodReference.Create(appLauncherServiceId, appLaunchedEventStreamMethodId, applicationId, connectionId);

            Task.Factory.StartNew(async () =>
            {
                await _client.Value.CallInvoker
                    .CallServerStreaming<Empty, AppLaunchedEvent>(methodCallDescriptor.CallDescriptor, new Empty())
                    .ResponseStream.PipeAsync(_appLaunchedSubject).ConfigureAwait(false);
            }, TaskCreationOptions.LongRunning);
        }

        public IObservable<AppLaunchedEvent> AppLaunchedStream { get; }
    }
}
