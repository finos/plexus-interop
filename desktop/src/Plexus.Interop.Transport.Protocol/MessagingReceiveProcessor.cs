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
namespace Plexus.Interop.Transport.Protocol
{
    using Plexus.Channels;
    using Plexus.Interop.Transport.Protocol.Internal;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using Plexus.Pools;
    using System;
    using System.Threading.Tasks;

    public sealed class MessagingReceiveProcessor : IMessagingReceiveProcessor
    {
        private readonly ILogger _log;
        private readonly IReadableChannel<IPooledBuffer> _connection;
        private readonly ITransportProtocolDeserializer _deserializer;
        private readonly IChannel<TransportMessage> _buffer = new BufferedChannel<TransportMessage>(3);

        public MessagingReceiveProcessor(
            ITransmissionConnection connection,
            ITransportProtocolDeserializer deserializer)
        {
            Id = connection.Id;
            _log = LogManager.GetLogger<MessagingReceiveProcessor>(Id.ToString());
            _connection = connection.In;
            _deserializer = deserializer;
            In.Completion.LogCompletion(_log);
            _buffer.Out.PropagateCompletionFrom(ProcessAsync());
        }

        public UniqueId Id { get; }

        public IReadableChannel<TransportMessage> In => _buffer.In;

        private async Task ProcessAsync()
        {
            try
            {
                await _connection.ConsumeAsync(HandleReceivedAsync).ConfigureAwait(false);
                _log.Trace("Receiving completed");
            }
            catch (Exception ex)
            {                
                _log.Trace("Receiving failed: {0}", ex.FormatTypeAndMessage());
                throw;
            }
        }

        private async Task HandleReceivedAsync(IPooledBuffer item)
        {
            ITransportHeader header;
            using (item)
            {
                header = _deserializer.Deserialize(item);
            }
            try
            {
                var payload = Maybe<IPooledBuffer>.Nothing;
                var expectedBodyLength = GetBodyLengthHandler.Instance.Handle(header);
                if (expectedBodyLength.HasValue)
                {
                    var body = await _connection.ReadAsync().ConfigureAwait(false);
                    if (body.Count != expectedBodyLength.Value)
                    {
                        body.Dispose();
                        throw new InvalidOperationException(
                            $"Received body length {body.Count} does not equal to the specified in header: {header}");
                    }
                    payload = new Maybe<IPooledBuffer>(body);
                }
                try
                {
                    var transportMessage = new TransportMessage(header, payload);
                    _log.Debug("Message received: {0}", transportMessage);
                    await _buffer.Out.WriteAsync(transportMessage).ConfigureAwait(false);
                }
                catch
                {
                    payload.GetValueOrDefault()?.Dispose();
                    throw;
                }
            }
            catch
            {
                header.Dispose();
                throw;
            }
        }
    }
}
