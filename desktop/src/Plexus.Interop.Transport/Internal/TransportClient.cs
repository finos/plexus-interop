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
namespace Plexus.Interop.Transport.Internal
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;

    internal sealed class TransportClient : ITransportClient
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

        public async ValueTask<ITransportConnection> ConnectAsync(string brokerWorkingDir, CancellationToken cancellationToken)
        {
            var transmissionConnection = await _transmissionClient.ConnectAsync(brokerWorkingDir, cancellationToken).ConfigureAwait(false);
            try
            {
                return _connectionFactory.Create(transmissionConnection);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                Log.Trace("Connection canceled");
                transmissionConnection.Dispose();
                throw;
            }
            catch (Exception ex)
            {
                Log.Trace("Connection failed: {0}", ex.FormatTypeAndMessage());
                transmissionConnection.Dispose();
                throw;
            }
        }

        public override string ToString()
        {
            return $"{{Transmission transport: {_transmissionClient.GetType().Name}}}";
        }
    }
}
