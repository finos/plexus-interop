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
    using System;
    using System.IO;
    using System.Reactive.Linq;
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
        private readonly AppLifecycleManagerClient _lifecycleManagerClient;
        private readonly AppLifecycleManager _appLifecycleManager;

        private readonly AppLifecycleServiceImpl _appLifecycleService;
        private readonly ContextLinkageServiceImpl _contextLinkageService;
        private AppLaunchedEventSubscriber _appLaunchedEventSubscriber;
        private bool _started = false;

        public InteropContext(string metadataDir, IRegistryProvider registryProvider)
        {
            RegistryProvider = registryProvider;
            var appRegistryProvider = new JsonFileAppRegistryProvider(Path.Combine(metadataDir, "apps.json"));
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir);

            var clientLazy = new Lazy<IClient>(() => _lifecycleManagerClient);
            var appLaunchedEventProvider = new AppLaunchedEventProvider();
            _appLifecycleManager = new AppLifecycleManager(appRegistryProvider, appLaunchedEventProvider, clientLazy);
            _appLaunchedEventSubscriber = new AppLaunchedEventSubscriber(_appLifecycleManager, registryProvider, appLaunchedEventProvider, clientLazy);

            var appMetadataService = new AppMetadataServiceImpl(appRegistryProvider, registryProvider);
            _appLifecycleService = new AppLifecycleServiceImpl(_appLifecycleManager);
            _contextLinkageService = new ContextLinkageServiceImpl(registryProvider, _appLifecycleManager, appLaunchedEventProvider);

            _lifecycleManagerClient = new AppLifecycleManagerClient(
                _appLifecycleService,
                appMetadataService,
                _contextLinkageService,
                s => s.WithBrokerWorkingDir(Directory.GetCurrentDirectory()));

            OnStop(_nativeAppLauncherClient.Stop);
            OnStop(() =>
            {
                _started = false;
                _lifecycleManagerClient.Disconnect();
            });
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<InteropContext>();

        protected override async Task<Task> StartCoreAsync()
        {
            _started = true;
            await Task.WhenAll(_lifecycleManagerClient.ConnectAsync(), _nativeAppLauncherClient.StartAsync());

            return Task.WhenAll(StartLifecycleManagerClientWithReconnect(), _nativeAppLauncherClient.Completion);
        }

        private async Task StartLifecycleManagerClientWithReconnect()
        {
            while (_started)
                {
                await _lifecycleManagerClient.Completion;

                    Log.Warn("AppLifecycleManager disconnected. Automatically reconnecting");
                await _lifecycleManagerClient.ConnectAsync();
            }
            await _lifecycleManagerClient.Completion;
        }
    }
}