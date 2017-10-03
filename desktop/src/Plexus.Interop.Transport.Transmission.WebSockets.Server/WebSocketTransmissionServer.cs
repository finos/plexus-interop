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
﻿namespace Plexus.Interop.Transport.Transmission.WebSockets.Server
{
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Hosting.Server.Features;
    using Microsoft.Extensions.DependencyInjection;
    using Plexus.Channels;
    using Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal;
    using System;
    using System.Collections.Concurrent;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Net.Sockets;
    using System.Net.WebSockets;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class WebSocketTransmissionServer : ITransmissionServer, IWebSocketHandler
    {
        private const string ServerName = "ws-v1";

        private static readonly ILogger Log = LogManager.GetLogger<WebSocketTransmissionServer>();

        private readonly ConcurrentDictionary<ITransmissionConnection, Nothing> _currentConnections
            = new ConcurrentDictionary<ITransmissionConnection, Nothing>();

        private IWebHost _host;
        private readonly IChannel<ITransmissionConnection> _incomingConnections = new BufferedChannel<ITransmissionConnection>(0);
        private readonly CancellationTokenSource _cancellation = new CancellationTokenSource();
        private readonly Promise _completion = new Promise();
        private readonly Promise _startCompletion = new Promise();
        private readonly Latch _started = new Latch();
        private readonly IServerStateWriter _stateWriter;

        public WebSocketTransmissionServer(string workingDir = null)
        {
            _stateWriter = new ServerStateWriter(ServerName, workingDir ?? Directory.GetCurrentDirectory());
        }

        public Task Completion => _completion.Task;

        public async Task HandleAsync(WebSocket websocket)
        {
            try
            {
                var connection = new WebSocketServerTransmissionConnection(websocket);
                _currentConnections.TryAdd(connection, Nothing.Instance);
                connection.Completion
                    .ContinueWithSynchronously(t => _currentConnections.TryRemove(connection, out _), CancellationToken.None)
                    .IgnoreAwait(Log);
                await _incomingConnections.Out.WriteAsync(connection).ConfigureAwait(false);
                Log.Info("Websocket connection accepted: {0}", websocket);
                await connection.Completion.ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                Log.Info("Websocket connection failed: {0}", ex.FormatTypeAndMessage());
                throw;
            }
        }

        public async ValueTask<ITransmissionConnection> CreateAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            Log.Debug("Waiting for incoming connection");
            var result = await _incomingConnections.In.TryReadAsync().ConfigureAwait(false);
            if (!result.HasValue)
            {
                cancellationToken.ThrowIfCancellationRequested();
                throw new InvalidOperationException("Web socket server closed");
            }
            return result.Value;
        }

        public async Task StartAsync()
        {
            if (!_started.TryEnter())
            {
                throw new InvalidOperationException("Server was already started");
            }

            try
            {
                Log.Debug("Starting");

                Task.Factory.StartNew(MainThreadAsync, TaskCreationOptions.LongRunning).Unwrap().PropagateCompletionToPromise(_completion);
                _incomingConnections.Out.PropagateCompletionFrom(_completion.Task);
                _completion.Task.PropagateCompletionToPromise(_startCompletion);

                await _startCompletion.Task.ConfigureAwait(false);                

                Log.Debug("Started");
            }
            catch (Exception ex)
            {
                _completion.TryFail(ex);
                throw;
            }
        }

        public async Task StopAsync()
        {
            try
            {
                if (_started.TryEnter())
                {
                    _completion.TryComplete();
                }
                Log.Debug("Stopping");
                _cancellation.Cancel();
                foreach (var con in _currentConnections.Keys)
                {                    
                    con.Out.TryTerminate();
                }
                await _completion.Task.ConfigureAwait(false);
                Log.Debug("Stopped");
            }
            catch
            {
                // ignore
            }
            finally
            {
                _stateWriter?.Dispose();
                _host?.Dispose();
                _host = null;
            }
        }

        public void Dispose()
        {
            StopAsync().GetResult();
        }

        public void OnListeningStarted()
        {
            try
            {
                var feature = _host.ServerFeatures.Get<IServerAddressesFeature>();
                var url = feature.Addresses.First();                
                _stateWriter.Write("address", url.Replace("http://", "ws://"));
                Log.Info("Listening started on url {0}", url);
                _stateWriter.SignalInitialized();                
                _startCompletion.TryComplete();
            }
            catch (Exception ex)
            {
                _startCompletion.TryFail(ex);
            }
        }

        private async Task MainThreadAsync()
        {            
            try
            {
                Log.Debug("Resolving localhost url");
                var hostEntry = Dns.GetHostEntryAsync("localhost").GetResult();
                var localhostIp = hostEntry.AddressList.First(addr => addr.AddressFamily == AddressFamily.InterNetwork);
                var url = $"http://{localhostIp}:0";
                _host = new WebHostBuilder()
                    .UseKestrel()
                    .UseUrls(url)
                    .UseContentRoot(Directory.GetCurrentDirectory())
                    .UseStartup<WebSocketServer>()
                    .ConfigureServices(s =>
                    {
                        s.AddSingleton<IWebSocketHandler>(this);
                    })
                    .Build();
                Log.Info("Starting server host on url {0}", url);
                await _host.RunAsync(_cancellation.Token).ConfigureAwait(false);
                Log.Info("Web server host stopped");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Web server host terminated with exception");
                throw;
            }
        }
    }
}
