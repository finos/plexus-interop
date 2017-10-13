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
    using Plexus.Interop.Transport.Internal;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using System;
    using System.Threading.Tasks;

    public sealed class TransportClient : ITransportClient, ITransportConnectionFactory
    {
        private static readonly ILogger Log = LogManager.GetLogger<TransportClient>();

        private readonly ITransmissionClient _transmissionClient;
        private readonly TransportConnectionFactory _connectionFactory;

        public TransportClient(
            ITransmissionClient transmissionClient,
            ITransportProtocolSerializationProvider serializationProvider)
        {
            _transmissionClient = transmissionClient;
            _connectionFactory = new TransportConnectionFactory(serializationProvider);
        }

        public async ValueTask<Maybe<ITransportConnection>> TryConnectAsync()
        {
            var result = await _transmissionClient.TryConnectAsync().ConfigureAwait(false);
            if (!result.HasValue)
            {
                return Maybe<ITransportConnection>.Nothing;
            }
            var transmissionConnection = result.Value;
            try
            {
                return new Maybe<ITransportConnection>(_connectionFactory.Create(transmissionConnection));
            }
            catch (Exception ex)
            {
                Log.Trace("Connection failed: {0}", ex.FormatTypeAndMessage());
                transmissionConnection.Dispose();
                throw;
            }
        }

        public async ValueTask<ITransportConnection> ConnectAsync()
        {
            return (await TryConnectAsync()).GetValueOrThrowException<OperationCanceledException>();
        }

        ValueTask<Maybe<ITransportConnection>> ITransportConnectionFactory.TryCreateAsync()
        {
            return TryConnectAsync();
        }

        ValueTask<ITransportConnection> ITransportConnectionFactory.CreateAsync()
        {
            return ConnectAsync();
        }

        public override string ToString()
        {
            return $"{{Transmission transport: {_transmissionClient.GetType().Name}}}";
        }
    }
}
