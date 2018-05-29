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
 namespace Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using SuperSocket.ClientEngine;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using WebSocket4Net;

    internal sealed class WebSocketClientTransmissionReader
    {
        private readonly ILogger _log;
        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly CancellationToken _cancellationToken;
        private readonly WebSocket _webSocket;

        public WebSocketClientTransmissionReader(
            UniqueId id,
            WebSocket webSocket, 
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<WebSocketClientTransmissionReader>(id.ToString());
            _cancellationToken = cancellationToken;
            _webSocket = webSocket;
            _webSocket.DataReceived += OnDataReceived;
            _webSocket.MessageReceived += OnMessageReceived;
            _webSocket.Closed += OnClosed;
            _webSocket.Error += OnError;

            Completion = ProcessAsync();
        }

        public Task Completion { get; }

        public IReadableChannel<IPooledBuffer> In => _buffer.In;

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
                _webSocket.DataReceived -= OnDataReceived;
                _webSocket.MessageReceived -= OnMessageReceived;
                _webSocket.Closed -= OnClosed;
                _webSocket.Error -= OnError;
            }
        }        

        private void OnError(object sender, ErrorEventArgs e)
        {
            _log.Trace("OnError: {0}", e.Exception.FormatToString());
            _buffer.Out.TryTerminate(e.Exception);
        }

        private void OnClosed(object sender, EventArgs e)
        {
            _log.Trace("OnClosed");
            _buffer.Out.TryTerminate();
        }

        private void OnMessageReceived(object sender, MessageReceivedEventArgs e)
        {
            if (string.Equals(e.Message, "<END>"))
            {
                _log.Trace("Received <END> message");
                _buffer.Out.TryComplete();
            }
            else
            {
                _log.Trace("OnMessageReceived: {0}", e.Message);
            }
        }

        private void OnDataReceived(object sender, DataReceivedEventArgs e)
        {
            _log.Trace("Received message of length={0}", e.Data.Length);
            var msg = PooledBuffer.Get(e.Data);
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
