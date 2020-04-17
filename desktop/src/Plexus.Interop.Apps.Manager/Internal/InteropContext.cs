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
namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
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

        public InteropContext(string metadataDir, IRegistryProvider registryProvider)
        {
            RegistryProvider = registryProvider;
            var appRegistryProvider = JsonFileAppRegistryProvider.Initialize(Path.Combine(metadataDir, "apps.json"));
            _nativeAppLauncherClient = new NativeAppLauncherClient(metadataDir);

            var clientLazy = new Lazy<IClient>(() => _lifecycleManagerClient);
            _appLifecycleManager = new AppLifecycleManager(appRegistryProvider, clientLazy);
            var appLaunchedEventProvider = new AppLaunchedEventProvider(_appLifecycleManager, registryProvider, clientLazy);

            var appMetadataService = new AppMetadataServiceImpl(appRegistryProvider, registryProvider);
            _appLifecycleService = new AppLifecycleServiceImpl(_appLifecycleManager);
            _contextLinkageService = new ContextLinkageServiceImpl(registryProvider, _appLifecycleManager, appLaunchedEventProvider);

            _lifecycleManagerClient = new AppLifecycleManagerClient(
                _appLifecycleService,
                appMetadataService,
                _contextLinkageService,
                s => s.WithBrokerWorkingDir(Directory.GetCurrentDirectory()));

            OnStop(_nativeAppLauncherClient.Stop);
            OnStop(_lifecycleManagerClient.Disconnect);
        }

        protected override async Task<Task> StartCoreAsync()
        {
            await Task.WhenAll(_lifecycleManagerClient.ConnectAsync(), _nativeAppLauncherClient.StartAsync());

            return Task.WhenAll(_lifecycleManagerClient.Completion, _nativeAppLauncherClient.Completion);
        }
    }
}