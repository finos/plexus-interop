/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Testing
{
    using Plexus.Interop.Testing.Generated;
    using Plexus.Processes;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using UniqueId = Plexus.UniqueId;

    internal sealed class TestAppLauncher : ProcessBase, TestAppLauncherClient.IAppLauncherServiceImpl
    {
        private readonly ITestBroker _broker;
        private readonly Dictionary<string, TestClientFactory> _clientFactories;
        private readonly ITestAppLauncherClient _client;

        private readonly object _sync = new object();

        private readonly Dictionary<string, List<Task<IClient>>> _createClientTasks
            = new Dictionary<string, List<Task<IClient>>>();

        private readonly Dictionary<string, List<IClient>> _createdClients
            = new Dictionary<string, List<IClient>>();

        public TestAppLauncher(ITestBroker broker, Dictionary<string, TestClientFactory> clientFactories)
        {
            _broker = broker;
            _clientFactories = clientFactories;
            _client = new TestAppLauncherClient(this, s => s.WithBrokerWorkingDir(broker.WorkingDir));
            OnStop(_client.Disconnect);
        }

        protected override async Task<Task> StartCoreAsync()
        {
            await _client.ConnectAsync().ConfigureAwait(false);
            return _client.Completion;
        }

        public async Task<AppLaunchResponse> Launch(AppLaunchRequest request, MethodCallContext context)
        {
            var appId = request.AppId;
            var suggestedAppInstanceId = UniqueId.FromHiLo(
                request.SuggestedAppInstanceId.Hi,
                request.SuggestedAppInstanceId.Lo);
            Task<IClient> clientTask = null;
            lock (_sync)
            {
                if (request.LaunchMode == AppLaunchMode.SingleInstance &&
                    _createdClients.TryGetValue(appId, out var clientList) &&
                    clientList.Any())
                {
                    var existingClient = clientList.First();
                    clientTask = Task.FromResult(existingClient);
                }

                if (request.LaunchMode != AppLaunchMode.MultiInstance && clientTask == null)
                {
                    if (_createClientTasks.TryGetValue(appId, out var list) && list.Any())
                    {
                        clientTask = list.First();
                    }
                }

                clientTask = clientTask ?? CreateClientAsync(appId, suggestedAppInstanceId);
            }

            var client = await clientTask.ConfigureAwait(false);

            OnStop(client.Disconnect);

            await client.ConnectAsync().ConfigureAwait(false);

            if (client.ApplicationInstanceId == suggestedAppInstanceId)
            {
                lock (_sync)
                {
                    if (_createClientTasks.TryGetValue(appId, out var list))
                    {
                        list.Remove(clientTask);
                        if (!list.Any())
                        {
                            _createClientTasks.Remove(appId);
                        }
                    }
                }
            }

            return new AppLaunchResponse
            {
                AppInstanceId = new Generated.UniqueId
                {
                    Hi = client.ApplicationInstanceId.Hi,
                    Lo = client.ApplicationInstanceId.Lo
                }
            };
        }

        private async Task<IClient> CreateClientAsync(string appId, UniqueId suggestedAppInstanceId)
        {
            if (!_clientFactories.TryGetValue(appId, out var clientFactory))
            {
                throw new InvalidOperationException($"Unknown application launch requested: {appId}");
            }
            
            var client = await clientFactory.CreateClientAsync(_broker, suggestedAppInstanceId).ConfigureAwait(false);

            lock (_sync)
            {
                if (!_createdClients.TryGetValue(appId, out var clientList))
                {
                    clientList = new List<IClient>();
                    _createdClients[appId] = clientList;
                }

                clientList.Add(client);

                client.Completion.IgnoreExceptions().ContinueWithInBackground(_ =>
                {
                    lock (_sync)
                    {
                        return clientList.Remove(client);
                    }
                }).IgnoreAwait();
            }

            return client;
        }
    }
}
