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
 namespace Plexus.Interop.CommandLineTool
{
    using Plexus.Host;
    using Plexus.Interop.CommandLineTool.Internal;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    public sealed class Program : IProgram
    {
        private static readonly ILogger Log = LogManager.GetLogger<Program>();

        private readonly CommandLineToolClient _client = new CommandLineToolClient();

        public async Task<Task> StartAsync(string[] args)
        {
            var options = CommandLineToolArguments.Parse(args);
            if (options.ApplicationIds.Count == 0)
            {
                return TaskConstants.Completed;
            }
            await _client.StartAsync().ConfigureAwait(false);
            return ProcessAsync(options);
        }

        private async Task ProcessAsync(CommandLineToolArguments options)
        {
            try
            {
                await Task.WhenAll(options.ApplicationIds.Select(ActivateAsync)).ConfigureAwait(false);
            }
            finally
            {
                await _client.StopAsync().ConfigureAwait(false);
            }
        }

        private async Task ActivateAsync(string appId)
        {
            try
            {
                Log.Info("Activating app {0}", appId);
                var response = await _client.ActivateAppAsync(appId).ConfigureAwait(false);
                var connectionId = UniqueId.FromHiLo(response.AppConnectionId.Hi, response.AppConnectionId.Lo);
                var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);
                Log.Info("Activated app {0}: connectionId={1}, appInstanceId={2}", appId, connectionId, appInstanceId);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Failed to activate app {0}", appId);
            }
        }

        public Task ShutdownAsync()
        {
            return _client.StopAsync();
        }
    }
}