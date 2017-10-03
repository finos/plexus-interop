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
﻿using System;
using System.Threading;
using System.Threading.Tasks;
using Plexus.Channels;
using Plexus.Interop.Transport.Protocol.Internal;
using Plexus.Interop.Transport.Protocol.Serialization;
using Plexus.Interop.Transport.Transmission;
using Plexus.Pools;

namespace Plexus.Interop.Transport.Protocol
{
    public sealed class MessagingReceiveProcessor : IMessagingReceiveProcessor
    {
        private readonly ILogger _log;
        private readonly IReadableChannel<IPooledBuffer> _connection;
        private readonly ITransportProtocolDeserializer _deserializer;

        public MessagingReceiveProcessor(
            ITransmissionConnection connection,
            ITransportProtocolDeserializer deserializer)
        {
            Id = connection.Id;
            _log = LogManager.GetLogger<MessagingReceiveProcessor>(Id.ToString());
            _connection = connection.In;
            _deserializer = deserializer;
            In = new ProducingChannel<TransportMessage>(3, ReceiveLoopAsync);
            In.Completion.LogCompletion(_log);
        }

        public UniqueId Id { get; }

        public IReadableChannel<TransportMessage> In { get; }

        private async Task ReceiveLoopAsync(IWriteOnlyChannel<TransportMessage> output, CancellationToken cancellationToken)
        {
            while (true)
            {
                var maybeData = await _connection.TryReadAsync().ConfigureAwait(false);
                if (!maybeData.HasValue)
                {
                    break;
                }
                ITransportHeader header;
                using (var serializedHeader = maybeData.Value)
                {
                    header = _deserializer.Deserialize(maybeData.Value);
                }
                try
                {
                    var body = Maybe<IPooledBuffer>.Nothing;
                    var expectedBodyLength = GetBodyLengthHandler.Instance.Handle(header);
                    if (expectedBodyLength.HasValue)
                    {
                        body = await _connection.TryReadAsync().ConfigureAwait(false);
                        if (!body.HasValue)
                        {
                            break;
                        }
                        if (body.Value.Count != expectedBodyLength.Value)
                        {
                            try
                            {
                                throw new InvalidOperationException($"Received body length {body.Value.Count} does not equal to the specified in header: {header}");
                            }
                            finally
                            {
                                body.Value.Dispose();
                            }
                        }
                    }
                    try
                    {
                        var transportMessage = new TransportMessage(header, body);
                        _log.Debug("Message received: {0}", transportMessage);
                        await output.WriteAsync(transportMessage).ConfigureAwait(false);                        
                    }
                    catch
                    {
                        if (body.HasValue)
                        {
                            body.Value.Dispose();
                        }
                        throw;
                    }                    
                }
                catch
                {
                    header.Dispose();
                    throw;
                }
            }
            _log.Debug("Incoming messages completed");
        }
    }
}
