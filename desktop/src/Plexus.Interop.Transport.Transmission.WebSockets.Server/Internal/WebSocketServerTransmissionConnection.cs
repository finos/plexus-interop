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
    using System;
    using Plexus.Channels;
    using Plexus.Pools;
    using System.Net.WebSockets;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class WebSocketServerTransmissionConnection : ITransmissionConnection
    {
        private readonly ILogger _log;
        private readonly WebSocket _webSocket;
        private readonly CancellationTokenSource _cancellation;
        private readonly WebSocketServerTransmissionWriter _writer;
        private readonly WebSocketServerTransmissionReader _reader;
        
        public WebSocketServerTransmissionConnection(WebSocket webSocket, CancellationToken cancellationToken)
        {
            Id = UniqueId.Generate();
            _log = LogManager.GetLogger<WebSocketServerTransmissionConnection>(Id.ToString());
            _cancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            _webSocket = webSocket;
            _writer = new WebSocketServerTransmissionWriter(_webSocket, _cancellation.Token);
            _reader = new WebSocketServerTransmissionReader(_webSocket, _cancellation.Token);
            Completion = ProcessAsync().LogCompletion(_log);
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public ITerminatableWritableChannel<IPooledBuffer> Out => _writer.Out;

        public IReadableChannel<IPooledBuffer> In => _reader.In;

        public void Dispose()
        {
            _log.Trace("Disposing");
            DisconnectAsync().GetResult();
        }

        public async Task DisconnectAsync()
        {
            _log.Trace("Disconnecting");
            _cancellation.Cancel();
            await Completion.IgnoreExceptions().ConfigureAwait(false);
            _log.Trace("Disconnected");
        }

        private async Task ProcessAsync()
        {
            using (_webSocket)
            {
                try
                {
                    await Task.WhenAny(_writer.Completion, _reader.Completion).Unwrap().ConfigureAwait(false);
                }
                catch
                {
                    _cancellation.Cancel();
                }
                await Task.WhenAll(_writer.Completion, _reader.Completion).IgnoreAnyCancellation().ConfigureAwait(false);
                _log.Trace("Closing websocket");
                try
                {
                    await _webSocket
                        .CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None)
                        .ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _log.Warn(ex, "Exception while closing websocket");
                }
                _log.Trace("Disposing websocket");
            }
        }
    }
}
