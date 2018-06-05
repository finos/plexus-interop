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
namespace Plexus.Interop.Transport.Protocol
{
    using Plexus.Channels;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using Plexus.Pools;
    using System;
    using System.Threading.Tasks;

    public sealed class MessagingSendProcessor : IMessagingSendProcessor
    {
        private readonly ILogger _log;
        private readonly ITransportProtocolSerializer _serializer;
        private readonly IChannel<TransportMessage> _buffer = new BufferedChannel<TransportMessage>(3);
        private readonly ITransmissionConnection _connection;

        public MessagingSendProcessor(
            ITransmissionConnection connection,
            ITransportProtocolSerializer serializer)
        {
            Id = connection.Id;
            _connection = connection;
            _log = LogManager.GetLogger<MessagingSendProcessor>(Id.ToString());
            _serializer = serializer;            
            _connection.Out.PropagateCompletionFrom(ProcessAsync());
            Completion = _connection.Out.Completion.LogCompletion(_log);
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public ITerminatableWritableChannel<TransportMessage> Out => _buffer.Out;
        
        private async Task ProcessAsync()
        {
            try
            {
                await _buffer.In.ConsumeAsync(SendAsync).ConfigureAwait(false);
                _log.Trace("Sending completed");
            }
            catch (Exception ex)
            {
                _log.Trace("Sending failed: {0}", ex.FormatTypeAndMessage());
                _buffer.Out.TryTerminate(ex);
                _buffer.In.DisposeBufferedItems();
                throw;
            }
        }

        private async Task SendAsync(TransportMessage message)
        {
            _log.Debug("Sending message: {0}", message);
            using (var header = message.Header)
            {
                var serializedHeader = _serializer.Serialize(header);
                await SendAsync(serializedHeader).ConfigureAwait(false);
                if (message.Payload.HasValue)
                {
                    var payload = message.Payload.Value;
                    await SendAsync(payload).ConfigureAwait(false);
                }
            }
        }

        private async Task SendAsync(IPooledBuffer message)
        {
            try
            {
                await _connection.Out.WriteAsync(message).ConfigureAwait(false);
            }
            catch
            {
                message.Dispose();
                throw;
            }
        }
    }
}
