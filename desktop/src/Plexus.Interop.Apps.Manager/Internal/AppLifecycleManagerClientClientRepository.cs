/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
    using System;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps.Internal.Generated;

    internal class AppLifecycleManagerClientClientRepository : IAppLifecycleManagerClientClientRepository
    {
        private ILogger Log { get; } = LogManager.GetLogger<AppLifecycleManagerClientClientRepository>();
        private readonly object _lifecycleClientAccess = new object();
        private readonly Subject<AppLifecycleManagerClient> _clientConnections = new Subject<AppLifecycleManagerClient>();

        private AppLifecycleManagerClient _lifecycleManagerClient = null;
        private bool _started = false;

        public void Stop()
        {
            _started = false;

            GetRunningClient()?.Disconnect();
        }

        public IObservable<AppLifecycleManagerClient> GetClientObservable()
        {
            var clientObservable = _clientConnections.AsObservable();

            AppLifecycleManagerClient runningClient = GetRunningClient();
            if (runningClient != null)
            {
                return Observable.Return(runningClient).Merge(clientObservable).DistinctUntilChanged();
            }

            return clientObservable;
        }

        public async Task<AppLifecycleManagerClient> GetClientAsync()
        {
            AppLifecycleManagerClient runningClient = GetRunningClient();
            if (runningClient != null)
            {
                return runningClient;
            }

            return await _clientConnections.AsObservable().FirstOrDefaultAsync();
        }

        public async Task Start(Func<AppLifecycleManagerClient> createClientFunc)
        {
            var client = createClientFunc();
            _started = true;

            while (_started)
            {
                await client.ConnectAsync();
                SetConnectedClient(client);
                if (!_started)
                {
                    Disconnect(client);
                }

                try
                {
                    await client.Completion;
                }
                catch (Exception ex)
                {
                    Log.Warn("AppLifecycleManager completed with error", ex);
                }

                RemoveCurrentClient();

                if (_started)
                {
                    Log.Info("Trying to automatically reconnect AppLifecycleManager client");
                    client = createClientFunc();
                }
            }

            _clientConnections.OnCompleted();
        }

        private void Disconnect(AppLifecycleManagerClient client)
        {
            client?.Disconnect();
        }

        private AppLifecycleManagerClient GetRunningClient()
        {
            lock (_lifecycleClientAccess)
            {
                return _lifecycleManagerClient;
            }
        }

        private void SetConnectedClient(AppLifecycleManagerClient client)
        {
            lock (_lifecycleClientAccess)
            {
                _lifecycleManagerClient = client;
            }
            _clientConnections.OnNext(client);
        }

        private void RemoveCurrentClient()
        {
            AppLifecycleManagerClient client;
            lock (_lifecycleClientAccess)
            {
                client = _lifecycleManagerClient;
                _lifecycleManagerClient = null;
            }
            client?.Dispose();
        }
    }
}