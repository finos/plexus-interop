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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using System;
    using System.Net.WebSockets;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class WebSocketServerTransmissionConnection : ITransmissionConnection
    {
        private static readonly byte[] EndMessage = Encoding.UTF8.GetBytes("<END>");

        private readonly ILogger _log;
        private readonly WebSocket _webSocket;
        private readonly byte[] _receiveBuffer = new byte[PooledBuffer.MaxSize];
        private readonly IChannel<IPooledBuffer> _receiveQueue = new BufferedChannel<IPooledBuffer>(3);
        private readonly IChannel<IPooledBuffer> _sendQueue = new BufferedChannel<IPooledBuffer>(1);

        public WebSocketServerTransmissionConnection(WebSocket webSocket)
        {
            Id = UniqueId.Generate();
            _log = LogManager.GetLogger<WebSocketServerTransmissionConnection>(Id.ToString());
            _webSocket = webSocket;
            Completion = TaskRunner.RunInBackground(ProcessAsync);
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public IReadableChannel<IPooledBuffer> In => _receiveQueue.In;

        public IWritableChannel<IPooledBuffer> Out => _sendQueue.Out;

        public void Dispose()
        {
            _log.Trace("Disposing");
            _webSocket.Dispose();
        }

        private async Task ProcessAsync()
        {
            try
            {
                _receiveQueue.Out.PropagateCompletionFrom(TaskRunner.RunInBackground(ReceiveInternalAsync));
                var sendTask = SendInternalAsync();
                await Task
                    .WhenAny(
                        sendTask,
                        _receiveQueue.In.Completion)
                    .Unwrap()
                    .ConfigureAwait(false);
                await Task
                    .WhenAll(
                        sendTask,
                        _receiveQueue.In.Completion)
                    .ConfigureAwait(false);
                _log.Trace("Closing socket");
                await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "", CancellationToken.None).ConfigureAwait(false);
            }
            catch
            {
                try
                {
                    await _webSocket.CloseAsync(WebSocketCloseStatus.InternalServerError, "", CancellationToken.None).ConfigureAwait(false);
                }
                catch
                {
                    try
                    {
                        _webSocket.Abort();
                    }
                    catch
                    {
                    }
                }
                throw;
            }
        }

        private void DisposeRejected(IPooledBuffer msg)
        {
            _log.Trace("Disposing rejected message of length {0}", msg.Count);
            msg.Dispose();
        }

        private async Task SendInternalAsync(IPooledBuffer msg)
        {
            using (msg)
            {
                _log.Trace("Sending message of length {0}", msg.Count);
                await _webSocket
                    .SendAsync(
                        new ArraySegment<byte>(msg.Array, msg.Offset, msg.Count),
                        WebSocketMessageType.Binary,
                        true,
                        CancellationToken.None)
                    .ConfigureAwait(false);
            }
        }

        private async Task SendInternalAsync()
        {
            await _sendQueue.ConsumeBufferAsync(SendInternalAsync, DisposeRejected).ConfigureAwait(false);
            _log.Trace("Sending completion message");
            await _webSocket.SendAsync(new ArraySegment<byte>(EndMessage, 0, EndMessage.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task ReceiveInternalAsync()
        {
            int curMessageLength = 0;
            while (!_receiveQueue.Out.IsCompleted())
            {
                var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(_receiveBuffer, curMessageLength, _receiveBuffer.Length - curMessageLength), CancellationToken.None).ConfigureAwait(false);
                _log.Trace("Received websocket message: {0}", result.MessageType);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _log.Trace("Received close message. Current state: {0}", _webSocket.State);
                    _receiveQueue.Out.TryComplete();
                    break;
                }
                curMessageLength += result.Count;
                if (!result.EndOfMessage)
                {
                    continue;
                }
                switch (result.MessageType)
                {
                    case WebSocketMessageType.Binary:
                        _log.Trace("Received binary message of length {0}", result.Count);
                        var msg = PooledBuffer.Get(new ArraySegment<byte>(_receiveBuffer, 0, curMessageLength));
                        try
                        {
                            await _receiveQueue.Out.WriteAsync(msg).ConfigureAwait(false);
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
                            _receiveQueue.Out.TryComplete();
                        }
                        else if (string.Equals(text, "<PING>"))
                        {
                            _log.Trace("Received <PING> message");
                        }
                        break;
                }
                curMessageLength = 0;
            }
            _receiveQueue.Out.TryComplete();
        }
    }
}
