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
    public sealed class MessagingSendProcessor : IMessagingSendProcessor
    {
        private readonly ILogger _log;
        private readonly ITransportProtocolSerializer _serializer;

        public MessagingSendProcessor(
            ITransmissionConnection connection,
            ITransportProtocolSerializer serializer)
        {
            Id = connection.Id;
            _log = LogManager.GetLogger<MessagingSendProcessor>(Id.ToString());
            _serializer = serializer;
            Out = new PropagatingChannel<TransportMessage, IPooledBuffer>(3, connection.Out, SendAsync, Dispose);
            Out.Completion.LogCompletion(_log);
        }

        public UniqueId Id { get; }

        public IWritableChannel<TransportMessage> Out { get; }

        private void Dispose(TransportMessage message)
        {
            _log.Trace("Disposing message of type {0}", message.Header.GetType().Name);
            message.Dispose();
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
                await output.WriteAsync(message).ConfigureAwait(false);
            }
            catch
            {
                message.Dispose();
                throw;
            }
        }
    }
}
