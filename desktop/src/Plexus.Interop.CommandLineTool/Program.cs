/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
 namespace Plexus.Interop.CommandLineTool
{
    using Plexus.Host;
    using Plexus.Interop.CommandLineTool.Internal;
    using System;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using Plexus.Interop.CommandLineTool.Internal.Generated;
    using UniqueId = Plexus.UniqueId;

    public sealed class Program : IProgram
    {
        private static readonly ILogger Log = LogManager.GetLogger<Program>();

        private readonly ICommandLineToolClient _client = new CommandLineToolClient(s => s.WithBrokerWorkingDir(Directory.GetCurrentDirectory()));

        public async Task<Task> StartAsync(string[] args)
        {
            var options = CommandLineToolArguments.Parse(args);
            if (options.ApplicationIds.Count == 0)
            {
                return TaskConstants.Completed;
            }
            await _client.ConnectAsync().ConfigureAwait(false);
            return ProcessAsync(options);
        }

        private async Task ProcessAsync(CommandLineToolArguments options)
        {
            try
            {
                await Task.WhenAll(options.ApplicationIds.Select(LaunchAppAsync)).ConfigureAwait(false);
            }
            finally
            {
                await _client.DisconnectAsync().ConfigureAwait(false);
            }
        }

        private async Task LaunchAppAsync(string appId)
        {
            try
            {
                Log.Info("Launching app {0}", appId);
                var request = new ResolveAppRequest
                {
                    AppId = appId,
                    AppResolveMode = AppLaunchMode.MultiInstance
                };
                var response = await _client.AppLifecycleService.ResolveApp(request).ConfigureAwait(false);
                var connectionId = UniqueId.FromHiLo(response.AppConnectionId.Hi, response.AppConnectionId.Lo);
                var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);
                Log.Info("Launched app {0}: connectionId={1}, appInstanceId={2}", appId, connectionId, appInstanceId);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Failed to launch app {0}", appId);
            }
        }

        public Task ShutdownAsync()
        {
            return _client.DisconnectAsync();
        }
    }
}