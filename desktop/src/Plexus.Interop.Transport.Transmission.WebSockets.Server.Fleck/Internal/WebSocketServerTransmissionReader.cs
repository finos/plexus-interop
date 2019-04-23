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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using global::Fleck;
    using Plexus.Channels;
    using Plexus.Pools;

    internal sealed class WebSocketServerTransmissionReader
    {
        private readonly ILogger _log;
        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly CancellationToken _cancellationToken;
        private readonly IWebSocketConnection _webSocket;

        public WebSocketServerTransmissionReader(
            UniqueId id,
            IWebSocketConnection webSocket, 
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<WebSocketServerTransmissionReader>(id.ToString());
            _cancellationToken = cancellationToken;
            _webSocket = webSocket;
            _webSocket.OnBinary += OnDataReceived;
            _webSocket.OnMessage += OnMessageReceived;

            Completion = ProcessAsync();
        }

        public Task Completion { get; }

        public IReadableChannel<IPooledBuffer> In => _buffer.In;

        public void OnClose()
        {
            _buffer.Out.TryComplete();
        }

        public void OnError(Exception ex)
        {
            _buffer.Out.TryTerminate(ex);
        }

        private async Task ProcessAsync()
        {
            try
            {
                await _buffer.Out.Completion.ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                _webSocket.OnBinary -= OnDataReceived;
                _webSocket.OnMessage -= OnMessageReceived;
            }
        }        

        private void OnMessageReceived(string message)
        {
            if (string.Equals(message, "<END>"))
            {
                _log.Trace("Received <END> message");
                _buffer.Out.TryComplete();
            }
            else
            {
                _log.Trace("OnMessageReceived: {0}", message);
            }
        }

        private void OnDataReceived(byte[] data)
        {
            _log.Trace("Received message of length={0}", data.Length);
            var msg = PooledBuffer.Get(data);
            try
            {
                _buffer.Out.WriteAsync(msg, _cancellationToken).GetResult();
            }
            catch (Exception ex)
            {                
                _log.Trace(ex, "Exception in OnDataReceived callback");
                msg.Dispose();
                _buffer.Out.TryTerminate(ex);
            }
        }        
    }
}
