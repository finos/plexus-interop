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
﻿namespace Plexus.Interop.Apps
{
    using Newtonsoft.Json;
    using Plexus.Interop.Apps.Internal;
    using Plexus.Interop.Apps.Internal.Generated;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Processes;
    using UniqueId = Plexus.UniqueId;

    public sealed class AppLifecycleManager : ProcessBase, IAppLifecycleManager
    {        
        private static readonly ILogger Log = LogManager.GetLogger<AppLifecycleManager>();

        private Lazy<Task<NativeAppLauncher>> _startNativeAppLauncherTask;

        private IClient _client;
        private readonly string _brokerWorkingDir;
        private readonly string _metadataDir;
        private readonly SubProcessLauncher _subProcessLauncher;
        private readonly JsonSerializer _jsonSerializer = JsonSerializer.CreateDefault();
        private AppsDto _appsDto;

        public AppLifecycleManager(string metadataDir)
        {
            _metadataDir = metadataDir;
            _brokerWorkingDir = Directory.GetCurrentDirectory();
            _subProcessLauncher = new SubProcessLauncher();
            _startNativeAppLauncherTask = new Lazy<Task<NativeAppLauncher>>(StartNativeAppLauncher, LazyThreadSafetyMode.ExecutionAndPublication);
        }

        public async ValueTask<UniqueId> LaunchAsync(string appId)
        {
            Log.Info("Launching {0}", appId);

            if (string.Equals(appId, "interop.NativeAppLauncher"))
            {
                return (await _startNativeAppLauncherTask.Value.ConfigureAwait(false)).Id;
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
            _appsDto = AppsDto.Load(Path.Combine(_metadataDir, "apps.json"));
            _client = ClientFactory.Instance.Create(
                new ClientOptionsBuilder()
                    .WithDefaultConfiguration(_brokerWorkingDir)
                    .WithApplicationId("interop.AppLifecycleManager")
                    .Build());
            var startNativeAppLauncherTask = _startNativeAppLauncherTask.Value;
            await Task.WhenAll(_client.ConnectAsync(), startNativeAppLauncherTask).ConfigureAwait(false);
            var nativeAppLauncher = startNativeAppLauncherTask.GetResult();
            return Task.WhenAll(_client.Completion, nativeAppLauncher.Completion);
        }

        private async Task<NativeAppLauncher> StartNativeAppLauncher()
        {
            var nativeAppLauncher = new NativeAppLauncher(_metadataDir, _subProcessLauncher, _jsonSerializer);
            var task = TaskRunner.RunInBackground(nativeAppLauncher.StartAsync);
            task.ContinueWithSynchronously(
                    x =>
                        _startNativeAppLauncherTask = new Lazy<Task<NativeAppLauncher>>(
                            StartNativeAppLauncher,
                            LazyThreadSafetyMode.ExecutionAndPublication),
                    CancellationToken.None)
                .IgnoreAwait(Log);
            await task.ConfigureAwait(false);
            return nativeAppLauncher;
        }
    }
}
