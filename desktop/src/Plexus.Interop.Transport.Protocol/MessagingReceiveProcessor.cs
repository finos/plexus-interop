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

namespace Plexus.Interop.Transport.Protocol
{
    using Plexus.Channels;
    using Plexus.Interop.Transport.Protocol.Internal;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using Plexus.Pools;
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class MessagingReceiveProcessor : IMessagingReceiveProcessor
    {
        private readonly ILogger _log;
        private readonly IReadOnlyChannel<IPooledBuffer> _connection;
        private readonly ITransportProtocolDeserializer _deserializer;
        private readonly CancellationToken _cancellationToken;
        private readonly IChannel<TransportMessage> _buffer = new BufferedChannel<TransportMessage>(3);

        public MessagingReceiveProcessor(
            ITransmissionConnection connection,
            ITransportProtocolDeserializer deserializer,
            CancellationToken cancellationToken = default)
        {
            Id = connection.Id;
            _log = LogManager.GetLogger<MessagingReceiveProcessor>(Id.ToString());
            _connection = connection.In;
            _deserializer = deserializer;
            _cancellationToken = cancellationToken;
            In = _buffer.In;
            In.Completion.LogCompletion(_log);
            _buffer.Out.PropagateCompletionFrom(TaskRunner.RunInBackground(ProcessAsync));
        }

        public UniqueId Id { get; }

        public IReadOnlyChannel<TransportMessage> In { get; }

        private async Task ProcessAsync()
        {
            while (await _connection.WaitReadAvailableAsync(_cancellationToken).ConfigureAwait(false))
            {
                while (_connection.TryRead(out var item))
                {
                    ITransportHeader header;
                    using (item)
                    {
                        header = _deserializer.Deserialize(item);
                    }
                    try
                    {
                        IPooledBuffer body = null;
                        var expectedBodyLength = GetBodyLengthHandler.Instance.Handle(header);
                        if (expectedBodyLength.HasValue)
                        {
                            body = await _connection.ReadAsync(_cancellationToken).ConfigureAwait(false);
                            if (body.Count != expectedBodyLength.Value)
                            {
                                try
                                {
                                    throw new InvalidOperationException(
                                        $"Received body length {body.Count} does not equal to the specified in header: {header}");
                                }
                                finally
                                {
                                    body.Dispose();
                                }
                            }
                        }
                        try
                        {
                            var transportMessage = new TransportMessage(header, new Maybe<IPooledBuffer>(body));
                            _log.Debug("Message received: {0}", transportMessage);
                            await _buffer.Out.WriteAsync(transportMessage, _cancellationToken).ConfigureAwait(false);
                        }
                        catch
                        {
                            body?.Dispose();
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
            _log.Debug("Incoming messages completed");
        }
    }
}
