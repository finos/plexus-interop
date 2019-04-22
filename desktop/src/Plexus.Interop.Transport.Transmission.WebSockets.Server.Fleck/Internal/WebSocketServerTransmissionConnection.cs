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
    using Plexus.Processes;

    internal sealed class WebSocketServerTransmissionConnection : ProcessBase, ITransmissionConnection
    {
        private static readonly TimeSpan ConnectionTimeout = TimeoutConstants.Timeout5Sec;

        private readonly ILogger _log;
        private readonly IWebSocketConnection _webSocket;
        private readonly WebSocketServerTransmissionReader _reader;
        private readonly WebSocketServerTransmissionWriter _writer;
        private readonly Promise _connectCompletion = new Promise();
        private readonly Promise _disconnectCompletion = new Promise();

        public WebSocketServerTransmissionConnection(IWebSocketConnection websocket)
        {            
            _log = LogManager.GetLogger<WebSocketServerTransmissionConnection>(Id.ToString());
            _webSocket = websocket;
            _disconnectCompletion.Task.PropagateCompletionToPromise(_connectCompletion);
            _webSocket.OnOpen += OnOpened;
            _webSocket.OnClose += OnClosed;
            _webSocket.OnError += OnError;

            _reader = new WebSocketServerTransmissionReader(Id, _webSocket, CancellationToken);
            _writer = new WebSocketServerTransmissionWriter(Id, _webSocket, CancellationToken);

            Completion.LogCompletion(_log);

            _log.Trace("Created");
        }

        private void OnError(Exception e)
        {
            _log.Trace("OnError: {0}", e.FormatTypeAndMessage());
            _reader.OnError(e);
            Stop();
            _disconnectCompletion.TryFail(e);
        }

        private void OnClosed()
        {
            _log.Trace("OnClosed");
            _reader.OnClose();
            Stop();
            _disconnectCompletion.TryComplete();
        }

        private void OnOpened()
        {
            _log.Trace("OnOpened");
            _connectCompletion.TryComplete();
        }

        public UniqueId Id { get; } = UniqueId.Generate();

        public IReadableChannel<IPooledBuffer> In => _reader.In;

        public ITerminatableWritableChannel<IPooledBuffer> Out => _writer.Out;

        public async Task ConnectAsync(CancellationToken cancellationToken)
        {
            using (var cancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken))
            using (cancellation.Token.Register(Stop, false))
            {
                cancellation.CancelAfter(ConnectionTimeout);
                try
                {
                    await StartAsync().ConfigureAwait(false);
                }
                finally
                {
                    cancellationToken.ThrowIfCancellationRequested();
                }
            }
        }

        public Task DisconnectAsync() => StopAsync();

        protected override async Task<Task> StartCoreAsync()
        {
            try
            {
                if (CancellationToken.IsCancellationRequested)
                {
                    _webSocket.Close();
                    return TaskConstants.Completed;
                }                
                _writer.Start();
                _log.Trace("Connected");
                return ProcessAsync();
            }
            catch
            {
                _webSocket.Close();
                throw;
            }
        }

        private async Task ProcessAsync()
        {
            try
            {
                try
                {
                    await Task.WhenAny(_writer.Completion, _reader.Completion).Unwrap().ConfigureAwait(false);
                }
                catch
                {
                    Stop();
                    throw;
                }
                finally
                {
                    await Task.WhenAll(_writer.Completion, _reader.Completion).ConfigureAwait(false);
                }
            }
            finally
            {
                _webSocket.Close();
                await _disconnectCompletion.Task.ConfigureAwait(false);
            }
        }
    }
}

