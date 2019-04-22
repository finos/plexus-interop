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
    using global::Fleck;
    using Plexus.Channels;
    using Plexus.Processes;
    using System;
    using System.IO;
    using System.Threading.Tasks;

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
            _buffer.Out.PropagateCompletionFrom(Completion);
        }

        public IReadableChannel<ITransmissionConnection> In => _buffer.In;

        protected override async Task<Task> StartCoreAsync()
        {
            FleckLog.Level = LogLevel.Debug;
            FleckLog.LogAction = (lvl, msg, exc) =>
            {
                Log.Trace(exc, msg);
            };
            using (_stateWriter)
            using (_server = CreateWebSocketServerWithRetry(_options.Port))
            {
                _server.RestartAfterListenError = true;
                _server.ListenerSocket.NoDelay = true;
                _server.Start(OnSocketConnection);
                _stateWriter.Write("address", "ws://" + _server.ListenerSocket.LocalEndPoint);
                _stateWriter.SignalInitialized();
                SetStartCompleted();
                await CancellationToken.ToAwaitable().AsTask().IgnoreAnyCancellation().ConfigureAwait(false);
            }
            return TaskConstants.Completed;
        }

        private WebSocketServer CreateWebSocketServerWithRetry(uint port)
        {
            var server = StartWebSocketServer($"ws://127.0.0.1:{port}", true);
            server = server ?? StartWebSocketServer($"ws://127.0.0.1:{port}", false);
            server = server ?? StartWebSocketServer($"ws://localhost:{port}", true);
            server = server ?? StartWebSocketServer($"ws://localhost:{port}", false);
            server = server ?? StartWebSocketServer($"ws://[::1]:{port}", false);
            if (server == null)
            {
                throw new InvalidOperationException("Failed to start websocket server");
            }
            return server;
        }

        private WebSocketServer StartWebSocketServer(string url, bool supportDualStack)
        {
            var server = new WebSocketServer(url, supportDualStack);
            try
            {
                server.RestartAfterListenError = true;
                server.ListenerSocket.NoDelay = true;
                server.Start(OnSocketConnection);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception while starting websocket server with url={0} and supportDualStack={1}", url, supportDualStack);
                try
                {
                    server.Dispose();
                }
                catch
                {
                    // skip
                }
                return null;
            }
            return server;
        }

        private void OnSocketConnection(IWebSocketConnection websocket)
        {
            Log.Trace("Handling websocket connection {0}: path={1}", websocket.ConnectionInfo.Id, websocket.ConnectionInfo.Path);
            var urlPath = websocket.ConnectionInfo.Path.TrimEnd('/');
            if (string.IsNullOrEmpty(urlPath))
            {
                TaskRunner.RunInBackground(AcceptWebSocketConnectionAsync, websocket).IgnoreAwait();
            }
            else
            {
                TaskRunner.RunInBackground(() => ReadFileAsync(websocket, urlPath)).IgnoreAwait();
            }
        }

        private async Task ReadFileAsync(IWebSocketConnection webSocket, string urlPath)
        {
            try
            {
                if (_options.StaticFileMappings.TryGetValue(urlPath, out var physicalPath))
                {
                    if (File.Exists(physicalPath))
                    {
                        using (var stream = File.Open(physicalPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                        using (var streamReader = new StreamReader(stream))
                        {
                            await webSocket.Send(await streamReader.ReadToEndAsync()).ConfigureAwait(false);
                        }
                    }
                }
            }
            finally
            {
                webSocket.Close();
            }
        }

        private async Task AcceptWebSocketConnectionAsync(object arg)
        {
            var websocket = (IWebSocketConnection) arg;
            var connection = new WebSocketServerTransmissionConnection(websocket);
            try
            {                
                connection.Start();
                using (CancellationToken.Register(connection.Stop))
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
