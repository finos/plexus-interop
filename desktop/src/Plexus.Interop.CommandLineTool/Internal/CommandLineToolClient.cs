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
﻿namespace Plexus.Interop.CommandLineTool.Internal
{
    using Plexus.Interop.CommandLineTool.Internal.Generated;
    using Plexus.Processes;
    using System.IO;
    using System.Threading.Tasks;

    internal sealed class CommandLineToolClient : ProcessBase
    {
        private static readonly UnaryMethod<ActivateAppRequest, ActivateAppResponse> ActivateAppMethood =
            Method.Unary<ActivateAppRequest, ActivateAppResponse>("interop.AppLifecycleService", "ActivateApp");

        private readonly IClient _client;

        public CommandLineToolClient()
        {
            var options =
                new ClientOptionsBuilder()
                    .WithApplicationId("interop.CommandLineTool")
                    .WithDefaultConfiguration(Directory.GetCurrentDirectory())
                    .Build();
            _client = ClientFactory.Instance.Create(options);
            OnStop(_client.Disconnect);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<CommandLineToolClient>();

        protected override async Task<Task> StartCoreAsync()
        {
            await _client.ConnectAsync().ConfigureAwait(false);
            return _client.Completion;
        }

        public async Task<ActivateAppResponse> ActivateAppAsync(string appId)
        {
            var response = await _client.Call(ActivateAppMethood, new ActivateAppRequest {AppId = appId});
            return response;
        }
    }
}
