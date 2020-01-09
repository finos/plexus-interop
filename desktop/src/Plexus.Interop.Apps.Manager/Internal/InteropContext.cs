namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Apps.Internal.Services;
    using Plexus.Interop.Metamodel;
    using Plexus.Processes;

    internal class InteropContext : ProcessBase, IInteropContext
    {
        public IRegistryProvider RegistryProvider { get; }

        public IClient LifecycleManagerClient => _lifecycleManagerClient;

        public IAppLifecycleManager AppLifecycleManager => _appLifecycleManager;

        public IInvocationEventProvider InvocationEventProvider => _appLifecycleService;

        private readonly NativeAppLauncherClient _nativeAppLauncherClient;
        private readonly AppLifecycleManagerClient _lifecycleManagerClient;
        private readonly AppLifecycleManager _appLifecycleManager;

        private readonly AppLifecycleServiceImpl _appLifecycleService;

        public InteropContext(string metadataDir, IRegistryProvider registryProvider)
        {
            RegistryProvider = registryProvider;
            var appRegistryProvider = JsonFileAppRegistryProvider.Initialize(Path.Combine(metadataDir, "apps.json"));
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir);

            _appLifecycleManager = new AppLifecycleManager(appRegistryProvider, new Lazy<IClient>(() => LifecycleManagerClient));

            var appMetadataService = new AppMetadataServiceImpl(appRegistryProvider, registryProvider);
            _appLifecycleService = new AppLifecycleServiceImpl(_appLifecycleManager);
            var contextLinkageService = new ContextLinkageServiceImpl(_appLifecycleManager);

            _lifecycleManagerClient = new AppLifecycleManagerClient(
                _appLifecycleService,
                appMetadataService,
                contextLinkageService,
                s => s.WithBrokerWorkingDir(Directory.GetCurrentDirectory()));

            OnStop(_nativeAppLauncherClient.Stop);
            OnStop(LifecycleManagerClient.Disconnect);
        }

        protected override async Task<Task> StartCoreAsync()
        {
            await Task.WhenAll(LifecycleManagerClient.ConnectAsync(), _nativeAppLauncherClient.StartAsync());
            return Task.WhenAll(LifecycleManagerClient.Completion, _nativeAppLauncherClient.Completion);
        }
    }
}