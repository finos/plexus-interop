/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Transport.Internal
{
    using Plexus.Interop.Transport.Protocol;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using System;

    internal sealed class TransportConnectionFactory
    {
        private static readonly ILogger Log = LogManager.GetLogger<TransportConnectionFactory>();

        private readonly ITransportProtocolSerializer _serializer;
        private readonly ITransportProtocolDeserializer _deserializer;

        public TransportConnectionFactory(ITransportProtocolSerializationProvider serializationProvider)
        {
            _serializer = serializationProvider.GetSerializer();
            _deserializer = serializationProvider.GetDeserializer(TransportHeaderPool.Instance);
        }

        public ITransportConnection Create(ITransmissionConnection transmissionConnection)
        {
            try
            {
                var sender = new TransportSendProcessor(transmissionConnection, TransportHeaderPool.Instance, _serializer);
                var receiver = new TransportReceiveProcessor(transmissionConnection, _deserializer);
                var connection = new TransportConnection(sender, receiver, TransportHeaderPool.Instance);
                Log.Trace("New connection created: {0}", connection.Id);
                return connection;
            }
            catch (Exception ex)
            {
                Log.Trace("Connection failed: {0}", ex.FormatTypeAndMessage());
                transmissionConnection.Dispose();
                throw;
            }
        }
    }
}
