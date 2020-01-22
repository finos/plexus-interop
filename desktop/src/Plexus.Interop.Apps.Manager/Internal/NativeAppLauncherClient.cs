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
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Processes;
    using System.IO;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;

    internal sealed class NativeAppLauncherClient : ProcessBase, Generated.NativeAppLauncherClient.IAppLauncherServiceImpl
    {
        private readonly SubProcessLauncher _subProcessLauncher;
        private readonly string _cmdBasePath;
        private readonly Subject<(AppLaunchRequest request, Plexus.UniqueId id)> _appLaunchedSubject = new Subject<(AppLaunchRequest request, Plexus.UniqueId id)>();
        private INativeAppLauncherClient _client;

        public Plexus.UniqueId Id { get; }

        public NativeAppLauncherClient(string cmdBasePath)
        {
            Id = Plexus.UniqueId.Generate();
            _cmdBasePath = cmdBasePath;
            _subProcessLauncher = new SubProcessLauncher();
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<NativeAppLauncherClient>();

        protected override async Task<Task> StartCoreAsync()
        {
            _client = new Generated.NativeAppLauncherClient(
                this,
                s => s.WithBrokerWorkingDir(Directory.GetCurrentDirectory()));
            await _client.ConnectAsync().ConfigureAwait(false);
            Log.Debug("Connected");
            return ProcessAsync();
        }

        Task<AppLaunchResponse> AppLauncherService.ILaunchImpl.Launch(AppLaunchRequest request, MethodCallContext context)
        {
            Log.Debug("Launch request received: {0}", request);
            var paramsDto = JsonConvert.Deserialize<NativeAppLauncherParamsDto>(request.LaunchParamsJson);
            var cmd = Path.Combine(_cmdBasePath, paramsDto.Cmd);
            var id = _subProcessLauncher.Launch(cmd, paramsDto.Args);
            _appLaunchedSubject.OnNext((request, id));
            Log.Trace("Launched app instance {0} by request: {1}", id, request);
            return Task.FromResult(new AppLaunchResponse
            {
                AppInstanceId = id.ToProto(),
            });
        }

        Task AppLauncherService.IAppLaunchedEventStreamImpl.AppLaunchedEventStream(Empty request, IWritableChannel<AppLaunchedEvent> responseStream, MethodCallContext callContext)
        {
            return _appLaunchedSubject.Select(launchEvent => new AppLaunchedEvent
            {
                AppInstanceId = launchEvent.id.ToProto(),
                AppIds = { launchEvent.request.AppId },
                Referrer = new AppLaunchReferrer
                {
                    AppInstanceId = launchEvent.request.Referrer.AppInstanceId,
                    ConnectionId = launchEvent.request.Referrer.ConnectionId,
                    AppId = launchEvent.request.Referrer.AppId,
                }
            }).PipeAsync(responseStream, callContext.CancellationToken);
        }

        private async Task ProcessAsync()
        {
            await _client.Completion.ConfigureAwait(false);
        }
    }
}
