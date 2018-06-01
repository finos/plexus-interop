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
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Hosting.Server.Features;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.FileProviders;
    using Plexus.Channels;
    using Plexus.Pools;
    using Plexus.Processes;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Net.Sockets;
    using System.Net.WebSockets;
    using System.Threading;
    using System.Threading.Tasks;
    using IMsLoggerFactory = Microsoft.Extensions.Logging.ILoggerFactory;

    internal sealed class WebSocketTransmissionServer : ProcessBase, ITransmissionServer
    {        
        private const int AcceptedConnectionsBufferSize = 20;
        private const string ServerName = "ws-v1";

        private IWebHost _host;
        private readonly IChannel<ITransmissionConnection> _buffer = new BufferedChannel<ITransmissionConnection>(AcceptedConnectionsBufferSize);
        private readonly IServerStateWriter _stateWriter;
        private readonly IReadOnlyCollection<(string UrlPath, string PhysicalPath)> _staticFileMappings;

        public WebSocketTransmissionServer(string workingDir, IReadOnlyCollection<(string UrlPath, string PhysicalPath)> staticFileMappings = null)
        {
            _staticFileMappings = staticFileMappings ?? Array.Empty<(string, string)>();
            _stateWriter = new ServerStateWriter(ServerName, workingDir);
            _buffer.Out.PropagateCompletionFrom(Completion);
        }

        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        protected override ILogger Log { get; } = LogManager.GetLogger<WebSocketTransmissionServer>();

        public IReadableChannel<ITransmissionConnection> In => _buffer.In;

        public async Task<Task> AcceptConnectionAsync(WebSocket websocket)
        {
            var connection = new WebSocketServerTransmissionConnection(websocket, CancellationToken);
            await _buffer.Out.WriteAsync(connection, CancellationToken).ConfigureAwait(false);
            Log.Trace("Websocket connection accepted");
            return connection.Completion;
        }        

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Trace("Starting");
            using (_stateWriter)
            {
                await Task.Factory
                    .StartNew(MainThreadAsync, TaskCreationOptions.LongRunning)
                    .Unwrap()
                    .ConfigureAwait(false);
            }
            return Task.CompletedTask;
        }

        public void OnListeningStarted()
        {
            var feature = _host.ServerFeatures.Get<IServerAddressesFeature>();
            var url = feature.Addresses.First();
            _stateWriter.Write("address", url.Replace("http://", "ws://"));
            Log.Info("Websocket server started: {0}", url);
            _stateWriter.SignalInitialized();
            SetStartCompleted();
        }

        private async Task MainThreadAsync()
        {
            Log.Trace("Resolving localhost url");
            var hostEntry = Dns.GetHostEntryAsync("localhost").GetResult();
            var localhostIp = hostEntry.AddressList.First(addr => addr.AddressFamily == AddressFamily.InterNetwork);
            var url = $"http://{localhostIp}:0";
            _host = new WebHostBuilder()
                .UseKestrel()
                .UseUrls(url)
                .UseContentRoot(Directory.GetCurrentDirectory())
                .Configure(Configure)
                .Build();
            Log.Trace("Starting server host: {0}", url);
            await _host.RunAsync(CancellationToken).ConfigureAwait(false);
        }

        private void Configure(IApplicationBuilder app)
        {
            Log.Debug("Configure");

            var loggerFactory = app.ApplicationServices.GetRequiredService<IMsLoggerFactory>();

            LogManager.ConfigureLogging(loggerFactory);

            var lifetime = app.ApplicationServices.GetRequiredService<IApplicationLifetime>();

            lifetime.ApplicationStarted.Register(OnListeningStarted, false);

            app.UseWebSockets(new WebSocketOptions
            {
                KeepAliveInterval = TimeSpan.FromSeconds(5),
                ReceiveBufferSize = PooledBuffer.MaxSize
            });

            app.Use(async (context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    try
                    {
                        Log.Trace("Websocket connection received");
                        var connectionTask = await AcceptWebsocketConnectionAsync(context).ConfigureAwait(false);
                        await connectionTask.ConfigureAwait(false);
                        Log.Trace("Websocket connection completed");
                    }
                    catch (Exception ex)
                    {
                        Log.Trace("Websocket connection terminated with exception: {0}", ex.FormatTypeAndMessage());
                        throw;
                    }
                }
                else
                {
                    Log.Trace("Non-websocket request received");
                    await next().ConfigureAwait(false);
                }
            });

            foreach (var (urlpath, physicalpath) in _staticFileMappings)
            {
                if (!Directory.Exists(physicalpath))
                {
                    continue;
                }

                app.UseStaticFiles(new StaticFileOptions
                {
                    RequestPath = urlpath,
                    FileProvider = new PhysicalFileProvider(physicalpath),                    
                });
            }
        }

        private async Task<Task> AcceptWebsocketConnectionAsync(HttpContext context)
        {
            Task connectionTask;
            await _semaphore.WaitAsync().ConfigureAwait(false);
            try
            {
                Log.Trace("Accepting websocket connection");
                var webSocket = await context.WebSockets.AcceptWebSocketAsync().ConfigureAwait(false);                
                connectionTask = await AcceptConnectionAsync(webSocket).ConfigureAwait(false);
                Log.Trace("Websocket connection accepted");
            }
            finally
            {
                _semaphore.Release();
            }
            return connectionTask;
        }
    }
}
