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
﻿namespace Plexus.Interop.Testing
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Plexus.Interop.Testing.Generated;
    using System.Threading.Tasks;
    using Plexus.Processes;
    using UniqueId = Plexus.UniqueId;

    public sealed class TestAppLauncher : ProcessBase
    {
        private readonly Dictionary<string, ClientOptionsBuilder> _clients;
        private readonly IClient _client;

        public TestAppLauncher(IEnumerable<ClientOptionsBuilder> clients = null)
        {
            _clients = clients?.ToDictionary(x => x.ApplicationId, x => x) ?? new Dictionary<string, ClientOptionsBuilder>();
            var options = new ClientOptionsBuilder()
                .WithDefaultConfiguration("TestBroker")
                .WithApplicationId("plexus.interop.testing.TestAppLauncher")
                .WithProvidedService(
                    "interop.AppLauncherService",
                    s => s.WithUnaryMethod<AppLaunchRequest, AppLaunchResponse>("Launch", LaunchAppAsync))
                .Build();
            _client = ClientFactory.Instance.Create(options);
            OnStop(_client.Disconnect);
        }

        protected override async Task<Task> StartCoreAsync()
        {
            await _client.ConnectAsync().ConfigureAwait(false);
            return _client.Completion;
        }

        private async Task<AppLaunchResponse> LaunchAppAsync(AppLaunchRequest request, MethodCallContext context)
        {
            if (!_clients.TryGetValue(request.AppId, out var clientOptions))
            {
                throw new InvalidOperationException($"Unknown application launch requested: {request.AppId}");
            }
            var instanceId = UniqueId.Generate();
            var client = ClientFactory.Instance.Create(clientOptions.WithAppInstanceId(instanceId).Build());
            await client.ConnectAsync().ConfigureAwait(false);
            return new AppLaunchResponse
            {
                AppInstanceId = new Generated.UniqueId
                {
                    Hi = instanceId.Hi,
                    Lo = instanceId.Lo
                }
            };
        }
    }
}
