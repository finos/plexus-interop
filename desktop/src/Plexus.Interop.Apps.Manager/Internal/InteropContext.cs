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
namespace Plexus.Interop.Apps.Internal
{
    using System.IO;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Apps.Internal.Services;
    using Plexus.Interop.Metamodel;
    using Plexus.Processes;
    using IContextLinkageManager = Plexus.Interop.Apps.IContextLinkageManager;

    internal class InteropContext : ProcessBase, IInteropContext
    {
        public IRegistryProvider RegistryProvider { get; }

        public IAppLifecycleManager AppLifecycleManager => _appLifecycleManager;

        public IInvocationEventProvider InvocationEventProvider => _appLifecycleService;
        public IContextLinkageManager ContextLinkageManager => _contextLinkageService;

        private readonly NativeAppLauncherClient _nativeAppLauncherClient;
        private readonly AppLifecycleManager _appLifecycleManager;

        private readonly AppLifecycleServiceImpl _appLifecycleService;
        private readonly ContextLinkageServiceImpl _contextLinkageService;
        private AppLaunchedEventSubscriber _appLaunchedEventSubscriber;
        private readonly  AppMetadataServiceImpl _appMetadataService;
        
        private readonly AppLifecycleManagerClientClientRepository _appLifecycleManagerClientClientRepository;

        public InteropContext(string metadataDir, IRegistryProvider registryProvider)
        {
            RegistryProvider = registryProvider;
            var appRegistryProvider = new JsonFileAppRegistryProvider(Path.Combine(metadataDir, "apps.json"));

            _appLifecycleManagerClientClientRepository = new AppLifecycleManagerClientClientRepository();
            var appLaunchedEventProvider = new AppLaunchedEventProvider();
            _appLifecycleManager = new AppLifecycleManager(appRegistryProvider, appLaunchedEventProvider, _appLifecycleManagerClientClientRepository);
            _appLaunchedEventSubscriber = new AppLaunchedEventSubscriber(_appLifecycleManager, registryProvider, appLaunchedEventProvider, _appLifecycleManagerClientClientRepository);

            var nativeLauncherInstanceId = Plexus.UniqueId.Generate();
            _appLifecycleManager.RegisterAppInstanceConnection(Generated.NativeAppLauncherClient.Id, nativeLauncherInstanceId);
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir, nativeLauncherInstanceId);

            _appMetadataService = new AppMetadataServiceImpl(appRegistryProvider, registryProvider);
            _appLifecycleService = new AppLifecycleServiceImpl(_appLifecycleManager);
            _contextLinkageService = new ContextLinkageServiceImpl(registryProvider, _appLifecycleManager, appLaunchedEventProvider);


            OnStop(_nativeAppLauncherClient.Stop);
            OnStop(_appLifecycleManagerClientClientRepository.Stop);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<InteropContext>();

        protected override Task<Task> StartCoreAsync()
        {
            var clientsCompletionTask = Task.WhenAll(_appLifecycleManagerClientClientRepository.Start(CreateAppLifecycleManagerClient), StartNativeAppLauncherClient());
            return Task.FromResult(clientsCompletionTask);
        }

        private async Task StartNativeAppLauncherClient()
        {
            await _nativeAppLauncherClient.StartAsync();
            await _nativeAppLauncherClient.Completion;
        }

        private AppLifecycleManagerClient CreateAppLifecycleManagerClient()
        {
            var id = Plexus.UniqueId.Generate();
            _appLifecycleManager.RegisterAppInstanceConnection(AppLifecycleManagerClient.Id, id);
            return new AppLifecycleManagerClient(
                _appLifecycleService,
                _appMetadataService,
                _contextLinkageService,
                s => s.WithAppInstanceId(id).WithBrokerWorkingDir(Directory.GetCurrentDirectory()));
        }
    }
}