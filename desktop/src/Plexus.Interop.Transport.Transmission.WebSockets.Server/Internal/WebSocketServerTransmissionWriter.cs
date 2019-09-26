/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
 namespace Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using System;
    using System.Net.WebSockets;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class WebSocketServerTransmissionWriter
    {
        private static readonly byte[] EndMessage = Encoding.UTF8.GetBytes("<END>");

        private readonly ILogger _log;
        private readonly WebSocket _webSocket;
        private readonly IChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly CancellationToken _cancellationToken;

        public WebSocketServerTransmissionWriter(WebSocket webSocket, CancellationToken cancellationToken)
        {
            Id = UniqueId.Generate();
            _log = LogManager.GetLogger<WebSocketServerTransmissionWriter>(Id.ToString());
            _webSocket = webSocket;
            _cancellationToken = cancellationToken;
            Completion = ProcessAsync();
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public ITerminatableWritableChannel<IPooledBuffer> Out => _buffer.Out;

        private async Task ProcessAsync()
        {
            using (_cancellationToken.Register(() => _buffer.Out.TryTerminate(), false))
            {
                try
                {
                    await _buffer.In.ConsumeAsync(SendAsync, _cancellationToken).ConfigureAwait(false);
                    await _webSocket.SendAsync(
                        new ArraySegment<byte>(EndMessage, 0, EndMessage.Length),
                        WebSocketMessageType.Text,
                        true,
                        _cancellationToken);
                }
                catch (Exception ex)
                {
                    _log.Trace("Writing terminated: {0}", ex.FormatTypeAndMessage());
                    _buffer.Out.TryTerminate(ex);
                    _buffer.In.DisposeBufferedItems();
                    throw;
                }
                _log.Trace("Writing completed");
            }
        }

        private async Task SendAsync(IPooledBuffer msg)
        {
            using (msg)
            {
                await _webSocket
                    .SendAsync(
                        new ArraySegment<byte>(msg.Array, msg.Offset, msg.Count),
                        WebSocketMessageType.Binary,
                        true,
                        _cancellationToken)
                    .ConfigureAwait(false);
            }
        }
    }
}
