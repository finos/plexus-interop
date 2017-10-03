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
﻿namespace Plexus.Interop.Transport
{
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;

    public sealed class TransportServer : ITransportServer
    {
        private readonly ITransmissionServer _transmissionServer;
        private readonly ITransportConnectionFactory _connectionFactory;

        public TransportServer(
            ITransmissionServer transmissionServer,
            ITransportProtocolSerializationProvider serializationProvider)
        {
            _connectionFactory = new TransportConnectionFactory(transmissionServer, serializationProvider);
            _transmissionServer = transmissionServer;
        }

        public Task Completion => _transmissionServer.Completion;

        public async Task StartAsync()
        {
            await _transmissionServer.StartAsync().ConfigureAwait(false);
        }

        public async Task StopAsync()
        {
            await _transmissionServer.StopAsync().ConfigureAwait(false);
        }

        public ValueTask<ITransportConnection> CreateAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            return _connectionFactory.CreateAsync(cancellationToken);
        }

        public void Dispose()
        {
            _transmissionServer.Dispose();
        }
    }
}
