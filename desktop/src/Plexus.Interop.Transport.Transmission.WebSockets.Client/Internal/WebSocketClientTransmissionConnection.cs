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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using Plexus.Processes;
    using SuperSocket.ClientEngine;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using WebSocket4Net;

    internal sealed class WebSocketClientTransmissionConnection : ProcessBase, ITransmissionConnection
    {
        private static readonly TimeSpan ConnectionTimeout = TimeSpan.FromSeconds(5);

        private readonly ILogger _log;
        private readonly WebSocket _webSocket;
        private readonly WebSocketClientTransmissionReader _reader;
        private readonly WebSocketClientTransmissionWriter _writer;
        private readonly Promise _connectCompletion = new Promise();
        private readonly Promise _disconnectCompletion = new Promise();

        public WebSocketClientTransmissionConnection(string url)
        {
            _log = LogManager.GetLogger<WebSocketClientTransmissionConnection>(Id.ToString());
            _disconnectCompletion.Task.PropagateCompletionToPromise(_connectCompletion);
            _webSocket = new WebSocket(url.Replace("http://", "ws://"));
            _webSocket.Opened += OnOpened;
            _webSocket.Closed += OnClosed;
            _webSocket.Error += OnError;

            _reader = new WebSocketClientTransmissionReader(Id, _webSocket, CancellationToken);
            _writer = new WebSocketClientTransmissionWriter(Id, _webSocket, CancellationToken);

            Completion.LogCompletion(_log);

            _log.Trace("Created");
        }

        private void OnError(object sender, ErrorEventArgs e)
        {
            _log.Trace("OnError: {0}", e.Exception.FormatTypeAndMessage());
            Stop();
            _disconnectCompletion.TryFail(e.Exception);
        }

        private void OnClosed(object sender, EventArgs e)
        {
            _log.Trace("OnClosed");
            Stop();
            _disconnectCompletion.TryComplete();
        }

        private void OnOpened(object sender, EventArgs e)
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
            using (cancellation.Token.Register(Stop))
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
                    _webSocket.Dispose();
                    return TaskConstants.Completed;
                }
                _log.Trace("Opening socket");
                _webSocket.Open();
                await _connectCompletion.Task.WithCancellation(CancellationToken).ConfigureAwait(false);
                _log.Trace("Connected");
                _writer.Start();
                return ProcessAsync();
            }
            catch
            {
                _webSocket.Dispose();
                throw;
            }
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
                    Stop();
                }
                await Task.WhenAll(_writer.Completion, _reader.Completion).ConfigureAwait(false);
                _webSocket.Close();
                await _disconnectCompletion.Task.ConfigureAwait(false);
            }
        }        
    }
}
