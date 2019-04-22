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
    using Fleck;
    using Plexus.Channels;
    using Plexus.Pools;
    using Plexus.Processes;

    internal sealed class WebSocketServerTransmissionWriter : ProcessBase
    {
        private readonly ILogger _log;
        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly CancellationToken _cancellationToken;
        private readonly IWebSocketConnection _webSocket;

        public WebSocketServerTransmissionWriter(
            UniqueId id,
            IWebSocketConnection webSocket,
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<WebSocketServerTransmissionReader>(id.ToString());
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
                await _buffer.In.ConsumeAsync(SendAsync, _cancellationToken).ConfigureAwait(false);
                _log.Trace("Sending <END> message");
                await _webSocket.Send("<END>").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                _buffer.In.DisposeBufferedItems();
                throw;
            }
        }

        private async Task SendAsync(IPooledBuffer msg)
        {
            using (msg)
            {
                _log.Trace("Sending message of length {0}", msg.Count);
                await _webSocket.Send(msg.ToArray()).ConfigureAwait(false);
            }
        }
    }
}
