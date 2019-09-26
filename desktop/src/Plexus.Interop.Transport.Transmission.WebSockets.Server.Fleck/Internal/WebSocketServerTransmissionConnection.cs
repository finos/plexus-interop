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
    using global::Fleck;
    using Plexus.Channels;
    using Plexus.Pools;
    using Plexus.Processes;
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class WebSocketServerTransmissionConnection : ProcessBase, ITransmissionConnection
    {
        private static readonly TimeSpan ConnectionTimeout = TimeoutConstants.Timeout5Sec;
        private static readonly TimeSpan PingTimeout = TimeoutConstants.Timeout5Sec;
        private static readonly byte[] EmptyMessage = new byte[0];

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

            _reader = new WebSocketServerTransmissionReader(Id, _webSocket, CancellationToken);
            _writer = new WebSocketServerTransmissionWriter(Id, _webSocket, CancellationToken);

            _webSocket.OnOpen += OnOpened;
            _webSocket.OnClose += OnClosed;
            _webSocket.OnError += OnError;
            _webSocket.OnPing += OnPing;
            _webSocket.OnPong += OnPong;

            Completion.LogCompletion(_log);

            _log.Trace("Created");
        }

        private void OnPong(byte[] obj)
        {
            _log.Trace("Pong received");
        }

        private void OnPing(byte[] obj)
        {
            _log.Trace("Ping received");
            TaskRunner.RunInBackground(() => _webSocket.SendPong(obj)).LogAndIgnoreExceptions(_log);
        }

        private void OnError(Exception e)
        {
            _log.Warn("OnError: {0}", e.FormatTypeAndMessage());
            _reader.OnError(e);
            Stop();
            _disconnectCompletion.TryFail(e);
        }

        private void OnClosed()
        {
            _log.Debug("OnClosed");
            _reader.OnClose();
            Stop();
            _disconnectCompletion.TryComplete();
        }

        private void OnOpened()
        {
            _log.Debug("OnOpened");
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
                    return Task.FromResult(TaskConstants.Completed);
                }        
                await _connectCompletion.Task.WithCancellation(CancellationToken).ConfigureAwait(false);
                StartPinging();
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

        private void StartPinging()
        {
            TaskRunner.RunInBackground(async () =>
            {
                _log.Info("Starting ping loop");
                try
                {
                    while (!CancellationToken.IsCancellationRequested)
                    {
                        _log.Trace("Sending ping");
                        await _webSocket.SendPing(EmptyMessage);
                        _log.Trace("Ping sent");
                        await Task.Delay(PingTimeout, CancellationToken);
                    }
                }
                catch (OperationCanceledException) when (CancellationToken.IsCancellationRequested)
                {                    
                }
                catch (Exception ex)
                {
                    _log.Error(ex, "Ping loop terminated because of the exception");
                }
                _log.Info("Ping loop finished");
            });
        }

        private async Task ProcessAsync()
        {
            try
            {
                try
                {
                    await Task.WhenAny(_writer.Completion, _reader.Completion).Unwrap().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _writer.Out.TryTerminate(ex);
                    _webSocket.Close();
                    throw;
                }
                finally
                {
                    await Task.WhenAll(_writer.Completion, _reader.Completion).ConfigureAwait(false);
                }
            }
            finally
            {                
                await _disconnectCompletion.Task.ConfigureAwait(false);
            }
        }
    }
}

