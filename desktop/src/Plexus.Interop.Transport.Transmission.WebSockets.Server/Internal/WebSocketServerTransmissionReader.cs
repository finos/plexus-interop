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

    internal sealed class WebSocketServerTransmissionReader
    {
        private readonly ILogger _log;
        private readonly WebSocket _webSocket;
        private readonly IChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly byte[] _receiveBuffer = new byte[PooledBuffer.MaxSize];
        private readonly CancellationToken _cancellationToken;

        public WebSocketServerTransmissionReader(WebSocket webSocket, CancellationToken cancellationToken)
        {
            Id = UniqueId.Generate();
            _log = LogManager.GetLogger<WebSocketServerTransmissionReader>(Id.ToString());
            _webSocket = webSocket;
            _cancellationToken = cancellationToken;
            Completion = ProcessAsync();
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public IReadableChannel<IPooledBuffer> In => _buffer.In;

        private async Task ProcessAsync()
        {
            try
            {
                using (_cancellationToken.Register(() => _buffer.Out.TryTerminate(), false))
                {
                    var curMessageLength = 0;
                    while (!_buffer.Out.IsCompleted())
                    {
                        _log.Trace("Awaiting next websocket message");
                        var result = await _webSocket
                            .ReceiveAsync(
                                new ArraySegment<byte>(
                                    _receiveBuffer,
                                    curMessageLength,
                                    _receiveBuffer.Length - curMessageLength),
                                _cancellationToken)
                            .WithCancellation(_cancellationToken)
                            .ConfigureAwait(false);
                        _log.Trace("Received websocket message: {0}", result.MessageType);
                        curMessageLength += result.Count;
                        if (!result.EndOfMessage)
                        {
                            continue;
                        }

                        await HandleReceiveMessageAsync(result, curMessageLength).ConfigureAwait(false);
                        curMessageLength = 0;
                    }

                    _buffer.Out.TryComplete();
                }
            }
            catch (Exception ex)
            {
                _log.Trace("Reading terminated: {0}", ex.FormatTypeAndMessage());
                _buffer.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                await _buffer.Out.Completion.ConfigureAwait(false);
            }
            _log.Trace("Reading completed");
        }

        private async Task HandleReceiveMessageAsync(WebSocketReceiveResult result, int curMessageLength)
        {
            switch (result.MessageType)
            {
                case WebSocketMessageType.Binary:
                    _log.Trace("Received binary message of length {0}", result.Count);
                    var msg = PooledBuffer.Get(new ArraySegment<byte>(_receiveBuffer, 0, curMessageLength));
                    try
                    {
                        await _buffer.Out.WriteAsync(msg, _cancellationToken).ConfigureAwait(false);
                        _log.Trace("Received binary message of length {0} added to buffer", result.Count);
                    }
                    catch
                    {
                        msg.Dispose();
                        throw;
                    }
                    break;
                case WebSocketMessageType.Text:
                    _log.Trace("Received text of length {0}", result.Count);
                    var text = Encoding.UTF8.GetString(_receiveBuffer, 0, result.Count);
                    if (string.Equals(text, "<END>"))
                    {
                        _log.Trace("Received <END> message");
                        _buffer.Out.TryComplete();
                    }
                    else if (string.Equals(text, "<PING>"))
                    {
                        _log.Trace("Received <PING> message");
                    }
                    break;
                case WebSocketMessageType.Close:
                    _buffer.Out.TryTerminate();
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
    }
}
