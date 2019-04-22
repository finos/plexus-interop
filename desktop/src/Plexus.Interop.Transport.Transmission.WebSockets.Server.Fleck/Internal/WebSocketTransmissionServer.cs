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
    using System.Threading.Tasks;
    using global::Fleck;
    using Plexus.Channels;
    using Plexus.Processes;

    internal sealed class WebSocketTransmissionServer : ProcessBase, ITransmissionServer
    {
        private const int AcceptedConnectionsBufferSize = 20;
        private const string ServerName = "ws-v1";
        private readonly WebSocketTransmissionServerOptions _options;
        private WebSocketServer _server;

        private readonly IChannel<ITransmissionConnection> _buffer = new BufferedChannel<ITransmissionConnection>(AcceptedConnectionsBufferSize);
        private readonly IServerStateWriter _stateWriter;

        public WebSocketTransmissionServer(WebSocketTransmissionServerOptions options)
        {
            _options = options;
            _stateWriter = new ServerStateWriter(ServerName, _options.WorkingDir);
        }

        public IReadableChannel<ITransmissionConnection> In => _buffer.In;

        protected override async Task<Task> StartCoreAsync()
        {
            FleckLog.Level = LogLevel.Debug;
            FleckLog.LogAction = (lvl, msg, exc) =>
            {
                Log.Trace(exc, msg);
            };
            using (_server = new WebSocketServer($"ws://127.0.0.1:{_options.Port}"))
            using (_stateWriter)
            {
                _server.RestartAfterListenError = true;
                _server.ListenerSocket.NoDelay = true;
                _server.Start(OnSocketConnection);
                _stateWriter.Write("address", "ws://" + _server.ListenerSocket.LocalEndPoint);
                _stateWriter.SignalInitialized();
                SetStartCompleted();
                await CancellationToken.ToAwaitable().ConfigureAwait(false);
            }
            return TaskConstants.Completed;
        }

        private void OnSocketConnection(IWebSocketConnection websocket)
        {
            Log.Trace("Handling websocket connection {0}: path={1}", websocket.ConnectionInfo.Id, websocket.ConnectionInfo.Path);
            if (string.IsNullOrEmpty(websocket.ConnectionInfo.Path) || websocket.ConnectionInfo.Path.Equals("/"))
            {
                TaskRunner.RunInBackground(AcceptWebSocketConnectionAsync, websocket).IgnoreAwait();
            }
        }

        private async Task AcceptWebSocketConnectionAsync(object arg)
        {
            var websocket = (IWebSocketConnection) arg;
            var connection = new WebSocketServerTransmissionConnection(websocket);
            try
            {                
                connection.Start();
                using (CancellationToken.Register(() => connection.Stop()))
                {
                    await _buffer.Out.WriteAsync(connection, CancellationToken).ConfigureAwait(false);
                    Log.Trace("Websocket connection {0} accepted", websocket.ConnectionInfo.Id);
                    await connection.Completion.ConfigureAwait(false);
                    Log.Trace("Websocket connection {0} completed", websocket.ConnectionInfo.Id);
                }
            }
            catch (Exception ex)
            {                
                Log.Error(ex, "Websocket connection {0} completed with exception", websocket.ConnectionInfo.Id);
                connection.Stop();
            }
        }        
    }
}
