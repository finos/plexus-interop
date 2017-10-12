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
﻿namespace Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using SuperSocket.ClientEngine;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using WebSocket4Net;

    internal sealed class WebSocketTransmissionClientConnection : ITransmissionConnection
    {        
        private static readonly TimeSpan CloseTimeout = TimeSpan.FromSeconds(3);

        private readonly ILogger _log;
        private readonly IChannel<IPooledBuffer> _receiveQueue = new BufferedChannel<IPooledBuffer>(3);
        private readonly IChannel<IPooledBuffer> _sendQueue = new BufferedChannel<IPooledBuffer>(1);
        private readonly Promise _connectCompletion = new Promise();
        private readonly Promise _disconnectCompletion = new Promise();
        private readonly WebSocket _socket;
        private readonly CancellationTokenRegistration _cancellationRegistration;

        public WebSocketTransmissionClientConnection(string url, CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<WebSocketTransmissionClientConnection>(Id.ToString());            
            _socket = new WebSocket(url.Replace("http://", "ws://"));
            _socket.DataReceived += OnDataReceived;
            _socket.MessageReceived += OnMessageReceived;
            _socket.Closed += OnClosed;
            _socket.Error += OnError;
            _socket.Opened += OnOpened;
            _log.Trace("Created");
            _cancellationRegistration = cancellationToken.Register(() => _socket.Dispose());
            Completion = TaskRunner.RunInBackground(ProcessAsync);
            Completion.PropagateCompletionToPromise(_connectCompletion);
        }

        public UniqueId Id { get; } = UniqueId.Generate();

        public Task Completion { get; }

        public Task ConnectCompletion => _connectCompletion.Task;

        public IReadableChannel<IPooledBuffer> In => _receiveQueue.In;

        public IWritableChannel<IPooledBuffer> Out => _sendQueue.Out;

        public void Dispose()
        {
            _log.Trace("Disposing");
            _cancellationRegistration.Dispose();
            _socket.Dispose();
        }

        private async Task ProcessAsync()
        {
            _log.Trace("Opening socket");
            _socket.Open();
            await _connectCompletion.Task.ConfigureAwait(false);
            try
            {
                await Task
                    .WhenAll(
                        SendInternalAsync(),
                        _receiveQueue.In.Completion)
                    .ConfigureAwait(false);
                _log.Trace("Waiting for socket close from server");
                var completedTask = await Task.WhenAny(Task.Delay(CloseTimeout, CancellationToken.None), _disconnectCompletion.Task).ConfigureAwait(false);
                if (completedTask != _disconnectCompletion.Task)
                {
                    _log.Trace("Closing socket forcibly after {0} sec timeout", CloseTimeout.TotalSeconds);
                    _socket.Close();
                }
            }
            catch (Exception ex)
            {
                _disconnectCompletion.TryFail(ex);
                _socket.Close();
            }
            finally
            {
                await _disconnectCompletion.Task.ConfigureAwait(false);
            }
        }

        private Task SendInternalAsync(IPooledBuffer msg)
        {
            using (msg)
            {
                _log.Trace("Sending message of length {0}", msg.Count);
                _socket.Send(msg.Array, msg.Offset, msg.Count);
            }
            return TaskConstants.Completed;
        }

        private void DisposeRejected(IPooledBuffer msg)
        {
            _log.Trace("Disposing rejected message of length {0}", msg.Count);
            msg.Dispose();
        }

        private void OnOpened(object sender, EventArgs e)
        {
            _log.Trace("OnOpened");
            _connectCompletion.TryComplete();
        }

        private void OnError(object sender, ErrorEventArgs e)
        {
            _log.Trace("OnError: {0}", e.Exception.FormatToString());
            _connectCompletion.TryFail(e.Exception);
            _receiveQueue.Out.TryTerminate(e.Exception);
            _sendQueue.Out.TryTerminate(e.Exception);
            _disconnectCompletion.TryFail(e.Exception);
        }

        private void OnClosed(object sender, EventArgs e)
        {
            _log.Trace("OnClosed");
            _connectCompletion.TryFail(new InvalidOperationException("Closed before connected"));
            _receiveQueue.Out.TryTerminate();
            _sendQueue.Out.TryTerminate();
            _disconnectCompletion.TryComplete();
        }

        private void OnMessageReceived(object sender, MessageReceivedEventArgs e)
        {
            if (string.Equals(e.Message, "<END>"))
            {
                _log.Trace("Received <END> message");
                _receiveQueue.Out.TryComplete();
            }
            else
            {
                _log.Trace("OnMessageReceived: {0}", e.Message);
            }
        }

        private async Task SendInternalAsync()
        {
            await _sendQueue.ConsumeBufferAsync(SendInternalAsync, DisposeRejected).ConfigureAwait(false);
            _log.Trace("Sending <END> message");
            _socket.Send("<END>");
        }

        private void OnDataReceived(object sender, DataReceivedEventArgs e)
        {
            try
            {
                _log.Trace("Received message of length={0}", e.Data.Length);
                if (!_receiveQueue.Out.TryWriteSafeAsync(PooledBuffer.Get(e.Data)).GetAwaiter().GetResult())
                {
                    _log.Trace("Failed to add received message to receive queueu");
                }
            }
            catch (Exception ex)
            {
                _log.Trace(ex, "Exception in OnDataReceived callback");
                _receiveQueue.Out.TryTerminate(ex);
            }
        }
    }
}
