/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Apps
{
    using Newtonsoft.Json;
    using Plexus.Interop.Apps.Internal;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Processes;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using UniqueId = Plexus.UniqueId;

    public sealed class AppLifecycleManager : ProcessBase, IAppLifecycleManager
    {        
        private readonly IClient _client;
        private readonly JsonSerializer _jsonSerializer = JsonSerializer.CreateDefault();
        private readonly NativeAppLauncher _nativeAppLauncher;
        private readonly AppsDto _appsDto;

        public AppLifecycleManager(string metadataDir)
        {
            _nativeAppLauncher = new NativeAppLauncher(metadataDir, _jsonSerializer);
            _appsDto = AppsDto.Load(Path.Combine(metadataDir, "apps.json"));
            _client = ClientFactory.Instance.Create(
                new ClientOptionsBuilder()
                    .WithDefaultConfiguration(Directory.GetCurrentDirectory())
                    .WithApplicationId("interop.AppLifecycleManager")
                    .Build());
            OnStop(_nativeAppLauncher.Stop);
            OnStop(_client.Disconnect);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<AppLifecycleManager>();

        public async ValueTask<UniqueId> LaunchAsync(string appId)
        {
            Log.Info("Launching {0}", appId);

            if (string.Equals(appId, "interop.AppLifecycleManager"))
            {
                await StartAsync().ConfigureAwait(false);
                return _client.ConnectionId;
            }

            if (string.Equals(appId, "interop.NativeAppLauncher"))
            {                
                await _nativeAppLauncher.StartAsync().ConfigureAwait(false);
                return _nativeAppLauncher.Id;
            }

            var appDto = _appsDto.Apps.FirstOrDefault(x => string.Equals(x.Id, appId));
            if (appDto == null)
            {
                throw new InvalidOperationException($"The requested application {appId} is not defined in application registry");
            }

            if (string.IsNullOrEmpty(appDto.LauncherId))
            {
                throw new InvalidOperationException($"Launcher is not defined for application {appId}");
            }

            var launchMethodReference =
                ProvidedMethodReference.Create("interop.AppLauncherService", "Launch", appDto.LauncherId);

            var response = await _client
                .CallUnary<AppLaunchRequest, AppLaunchResponse>(
                    launchMethodReference.CallDescriptor,
                    new AppLaunchRequest
                    {
                        AppId = appId,
                        LaunchParamsJson = appDto.LauncherParams.ToString()
                    })
                .ConfigureAwait(false);

            var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);

            Log.Info("Launched app {0} instance {1}", appId, appInstanceId);

            return appInstanceId;
        }

        public IEnumerable<string> GetAvailableApps(IEnumerable<string> appIds)
        {
            // TODO: filter out available apps according to information received from app launchers
            return appIds;
        }

        protected override async Task<Task> StartCoreAsync()
        {
            await _client.ConnectAsync().ConfigureAwait(false);
            return ProcessAsync();
        }

        private Task ProcessAsync()
        {
            return Task.WhenAll(_client.Completion, _nativeAppLauncher.Completion);
        }
    }
}
