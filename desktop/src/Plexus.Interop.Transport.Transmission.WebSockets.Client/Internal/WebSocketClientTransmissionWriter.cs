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
 namespace Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using Plexus.Processes;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using WebSocket4Net;

    internal sealed class WebSocketClientTransmissionWriter : ProcessBase
    {
        private readonly ILogger _log;
        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly CancellationToken _cancellationToken;
        private readonly WebSocket _webSocket;

        public WebSocketClientTransmissionWriter(
            UniqueId id,
            WebSocket webSocket,
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<WebSocketClientTransmissionReader>(id.ToString());
            _cancellationToken = cancellationToken;
            _webSocket = webSocket;
        }

        public ITerminatableWritableChannel<IPooledBuffer> Out => _buffer.Out;

        protected override Task<Task> StartCoreAsync()
        {
            return Task.FromResult(ProcessAsync());
        }        

        private async Task ProcessAsync()
        {
            try
            {
                await _buffer.In.ConsumeAsync((Action<IPooledBuffer>) Send, _cancellationToken).ConfigureAwait(false);
                _log.Trace("Sending <END> message");
                _webSocket.Send("<END>");
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                _buffer.In.DisposeBufferedItems();
                throw;
            }
        }

        private void Send(IPooledBuffer msg)
        {
            using (msg)
            {
                _log.Trace("Sending message of length {0}", msg.Count);
                _webSocket.Send(msg.Array, msg.Offset, msg.Count);
            }
        }
    }
}
