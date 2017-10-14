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
﻿using System.Threading.Tasks;
using Plexus.Channels;
using Plexus.Interop.Transport.Protocol.Serialization;
using Plexus.Interop.Transport.Transmission;
using Plexus.Pools;

namespace Plexus.Interop.Transport.Protocol
{
    using System.Threading;

    public sealed class MessagingSendProcessor : IMessagingSendProcessor
    {
        private readonly ILogger _log;
        private readonly ITransportProtocolSerializer _serializer;
        private readonly IChannel<TransportMessage> _buffer = new BufferedChannel<TransportMessage>(3);
        private readonly ITransmissionConnection _connection;
        private readonly CancellationToken _cancellationToken;

        public MessagingSendProcessor(
            ITransmissionConnection connection,
            ITransportProtocolSerializer serializer,
            CancellationToken cancellationToken = default)
        {
            Id = connection.Id;
            _connection = connection;
            _cancellationToken = cancellationToken;
            _log = LogManager.GetLogger<MessagingSendProcessor>(Id.ToString());
            _serializer = serializer;
            Completion = TaskRunner.RunInBackground(ProcessAsync);
            _buffer.Out.PropagateCompletionFrom(Completion);
            Completion.LogCompletion(_log);            
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public IWritableChannel<TransportMessage> Out => _buffer.Out;
        
        private async Task ProcessAsync()
        {
            while (await _buffer.In.WaitReadAvailableAsync(_cancellationToken))
            {
                while (_buffer.In.TryRead(out var item))
                {
                    await SendAsync(item, _connection.Out).ConfigureAwait(false);
                }
            }
        }

        private async Task SendAsync(TransportMessage message, IWriteOnlyChannel<IPooledBuffer> output)
        {
            _log.Debug("Sending message: {0}", message);
            using (var header = message.Header)
            {
                var serializedHeader = _serializer.Serialize(header);
                await SendAsync(serializedHeader, output).ConfigureAwait(false);
                if (message.Payload.HasValue)
                {
                    var payload = message.Payload.Value;
                    await SendAsync(payload, output).ConfigureAwait(false);
                }
            }
        }

        private async Task SendAsync(IPooledBuffer message, IWriteOnlyChannel<IPooledBuffer> output)
        {
            try
            {
                await output.WriteAsync(message, _cancellationToken).ConfigureAwait(false);
            }
            catch
            {
                message.Dispose();
                throw;
            }
        }
    }
}
