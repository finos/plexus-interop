/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
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

        private readonly ReplaySubject<AppLaunchedEvent> _appLaunchedEvents = new ReplaySubject<AppLaunchedEvent>(5);

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

                clientTask = clientTask ?? CreateClientAsync(appId, suggestedAppInstanceId, request.Referrer);
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
                AppInstanceId = ConvertUniqueId(client.ApplicationInstanceId)
            };
        }

        private async Task<IClient> CreateClientAsync(string appId, UniqueId suggestedAppInstanceId, AppLaunchReferrer requestReferrer)
        {
            if (!_clientFactories.TryGetValue(appId, out var clientFactory))
            {
                throw new InvalidOperationException($"Unknown application launch requested: {appId}");
            }

            _appLaunchedEvents.OnNext(new AppLaunchedEvent { AppInstanceId = ConvertUniqueId(suggestedAppInstanceId), Referrer = requestReferrer, AppIds = { appId } });

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

        public IServerStreamingMethodCall<AppLifecycleEvent> GetLifecycleEventStream()
        {
            return _client.AppLifecycleService.GetLifecycleEventStream(new Empty());
        }

        public IServerStreamingMethodCall<InvocationEvent> GetInvocationEventStream()
        {
            return _client.AppLifecycleService.GetInvocationEventStream(new Empty());
        }

        public async Task AppLaunchedEventStream(Empty request, IWritableChannel<AppLaunchedEvent> responseStream, MethodCallContext context)
        {
            Log.Debug("AppLaunchedEventStream pipe started");
            await _appLaunchedEvents.PipeAsync(responseStream, context.CancellationToken).ConfigureAwait(false);
            Log.Debug("AppLaunchedEventStream pipe finished");
        }

        private static Generated.UniqueId ConvertUniqueId(UniqueId suggestedAppInstanceId)
        {
            return new Generated.UniqueId
            {
                Hi = suggestedAppInstanceId.Hi,
                Lo = suggestedAppInstanceId.Lo,
            };
        }
    }
}
