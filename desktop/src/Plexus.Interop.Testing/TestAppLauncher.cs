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
    using System.Threading.Tasks;
    using UniqueId = Plexus.UniqueId;

    internal sealed class TestAppLauncher : ProcessBase, TestAppLauncherClient.IAppLauncherServiceImpl
    {
        private readonly ITestBroker _broker;
        private readonly Dictionary<string, TestClientFactory> _clientFactories;
        private readonly ITestAppLauncherClient _client;

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
            if (!_clientFactories.TryGetValue(request.AppId, out var clientFactory))
            {
                throw new InvalidOperationException($"Unknown application launch requested: {request.AppId}");
            }
            var client = clientFactory(_broker, UniqueId.FromHiLo(request.SuggestedAppInstanceId.Hi, request.SuggestedAppInstanceId.Lo));
            OnStop(client.Disconnect);
            await client.ConnectAsync().ConfigureAwait(false);
            return new AppLaunchResponse
            {
                AppInstanceId = new Generated.UniqueId
                {
                    Hi = client.ApplicationInstanceId.Hi,
                    Lo = client.ApplicationInstanceId.Lo
                }
            };
        }
    }
}
