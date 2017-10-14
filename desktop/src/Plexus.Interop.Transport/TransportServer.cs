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
namespace Plexus.Interop.Transport
{
    using System;
    using Plexus.Interop.Transport.Internal;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using System.Threading.Tasks;

    public sealed class TransportServer : ITransportServer
    {
        private readonly ITransmissionServer _transmissionServer;
        private readonly TransportConnectionFactory _connectionFactory;

        public TransportServer(
            ITransmissionServer transmissionServer,
            ITransportProtocolSerializationProvider serializationProvider)
        {
            _connectionFactory = new TransportConnectionFactory(serializationProvider);
            _transmissionServer = transmissionServer;
        }

        public async ValueTask<ITransportConnection> AcceptAsync()
        {
            return (await TryAcceptAsync()).GetValueOrThrowException<OperationCanceledException>();
        }

        public Task Completion => _transmissionServer.Completion;

        public async Task StartAsync()
        {
            await _transmissionServer.StartAsync().ConfigureAwait(false);
        }

        public async ValueTask<Maybe<ITransportConnection>> TryAcceptAsync()
        {
            var connection = await _transmissionServer.TryAcceptAsync();
            return connection.HasValue
                ? new Maybe<ITransportConnection>(_connectionFactory.Create(connection.Value))
                : Maybe<ITransportConnection>.Nothing;
        }

        public void Dispose()
        {
            _transmissionServer.Dispose();
            Completion.IgnoreExceptions().GetResult();
        }
    }
}
