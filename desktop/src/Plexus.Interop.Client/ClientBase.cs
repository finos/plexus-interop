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
﻿namespace Plexus.Interop
{
    using System.Threading.Tasks;

    public abstract class ClientBase : IClient
    {
        private readonly IClient _client;

        protected ClientBase(ClientOptions options)
        {
            _client = ClientFactory.Instance.Create(options);
        }

        public IClientCallInvoker CallInvoker => _client.CallInvoker;

        public IClientDiscoveryInvoker DiscoveryInvoker => _client.DiscoveryInvoker;

        public string ApplicationId => _client.ApplicationId;

        public UniqueId ApplicationInstanceId => _client.ApplicationInstanceId;

        public UniqueId ConnectionId => _client.ConnectionId;

        public Task Completion => _client.Completion;

        public void Dispose()
        {
            _client.Dispose();
        }

        public Task ConnectAsync()
        {
            return _client.ConnectAsync();
        }

        public void Disconnect()
        {
            _client.Disconnect();
        }

        public Task DisconnectAsync()
        {
            return _client.DisconnectAsync();
        }
    }
}
