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
        private readonly AppMetadataServiceImpl _appMetadataService;
        private AppLifecycleManagerClient _lifecycleManagerClient;
        private AppLaunchedEventSubscriber _appLaunchedEventSubscriber;
        private bool _started = false;
        private readonly object _lifecycleClientAccess = new object();

        public InteropContext(string metadataDir, IRegistryProvider registryProvider)
        {
            RegistryProvider = registryProvider;
            var appRegistryProvider = new JsonFileAppRegistryProvider(Path.Combine(metadataDir, "apps.json"));
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir);

            var appLaunchedEventProvider = new AppLaunchedEventProvider();
            _appLifecycleManager = new AppLifecycleManager(appRegistryProvider, appLaunchedEventProvider, GetAppLifecycleManagerClientCallInvoker);
            _appLaunchedEventSubscriber = new AppLaunchedEventSubscriber(_appLifecycleManager, registryProvider, appLaunchedEventProvider, GetAppLifecycleManagerClientCallInvoker);

            
            _appMetadataService = new AppMetadataServiceImpl(appRegistryProvider, registryProvider);
            _appLifecycleService = new AppLifecycleServiceImpl(_appLifecycleManager);
            _contextLinkageService = new ContextLinkageServiceImpl(registryProvider, _appLifecycleManager, appLaunchedEventProvider);

            _lifecycleManagerClient = CreateAppLifecycleManagerClient();

            OnStop(_nativeAppLauncherClient.Stop);
            OnStop(() =>
            {
                _started = false;
                lock (_lifecycleClientAccess)
                {
                    _lifecycleManagerClient.Disconnect();
                }
            });
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<InteropContext>();

        protected override Task<Task> StartCoreAsync()
        {
            _started = true;
            var clientsCompletionTask = Task.WhenAll(StartLifecycleManagerClientWithReconnect(), StartNativeAppLauncherClient());
            return Task.FromResult(clientsCompletionTask);
        }

        private AppLifecycleManagerClient CreateAppLifecycleManagerClient()
        {
            return new AppLifecycleManagerClient(
                _appLifecycleService,
                _appMetadataService,
                _contextLinkageService,
                s => s.WithBrokerWorkingDir(Directory.GetCurrentDirectory()));
        }

        private IClientCallInvoker GetAppLifecycleManagerClientCallInvoker()
        {
            lock (_lifecycleClientAccess)
            {
                return _lifecycleManagerClient.CallInvoker;
            }
        }

        private async Task StartNativeAppLauncherClient()
        {
            await _nativeAppLauncherClient.StartAsync();
            await _nativeAppLauncherClient.Completion;
        }

        private async Task StartLifecycleManagerClientWithReconnect()
        {
            while (_started)
            {
                await ConnectLifecycleManagerClient();

                try
                {
                    await GetLifecycleManagerClientCompletion();
                }
                catch (Exception ex)
                {
                    Log.Warn("AppLifecycleManager completed with error", ex);
                }

                await Task.Delay(TimeSpan.FromSeconds(5));
                if (_started)
                {
                    Log.Info("Trying to automatically reconnect AppLifecycleManager client");
                    lock (_lifecycleClientAccess)
                    {
                        _lifecycleManagerClient.Dispose();
                        _lifecycleManagerClient = CreateAppLifecycleManagerClient();
                    }
                }
            }
        }

        private Task ConnectLifecycleManagerClient()
        {
            lock (_lifecycleClientAccess)
            {
                return _lifecycleManagerClient.ConnectAsync();
            }
        }

        private Task GetLifecycleManagerClientCompletion()
        {
            lock (_lifecycleClientAccess)
            {
                return _lifecycleManagerClient.Completion;
            }
        }
    }
}