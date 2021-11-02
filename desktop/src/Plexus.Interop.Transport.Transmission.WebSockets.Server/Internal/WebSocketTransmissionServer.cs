/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Net.Sockets;
    using System.Net.WebSockets;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using IMsLoggerFactory = Microsoft.Extensions.Logging.ILoggerFactory;

    internal sealed class WebSocketTransmissionServer : ProcessBase, ITransmissionServer
    {        
        private const int AcceptedConnectionsBufferSize = 20;

        private readonly X509Certificate2 _certificate = null;

        private IWebHost _host;
        private readonly IChannel<ITransmissionConnection> _buffer = new BufferedChannel<ITransmissionConnection>(AcceptedConnectionsBufferSize);
        private readonly IServerStateWriter _stateWriter;
        private readonly WebSocketTransmissionServerOptions _options;
        private readonly string _protocol;

        private WebSocketTransmissionServer(WebSocketTransmissionServerOptions options, string protocol)
        {
            _options = options;
            _protocol = protocol;
            var serverName = $"{protocol}-v1";
            _stateWriter = new ServerStateWriter(serverName, _options.WorkingDir);
            _buffer.Out.PropagateCompletionFrom(Completion);
        }

        public WebSocketTransmissionServer(WebSocketTransmissionServerOptions options)
            : this(options, "ws")
        {
        }

        public WebSocketTransmissionServer(WebSocketTransmissionServerOptions options, X509Certificate2 certificate)
            : this(options, "wss")
        {
            _certificate = certificate;
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
            _stateWriter.Write("address", url.Replace("http://", "ws://").Replace("https://", "wss://"));
            Log.Info("Websocket server started: {0}", url);
            _stateWriter.SignalInitialized();
            SetStartCompleted();
        }

        private async Task MainThreadAsync()
        {
            Log.Trace("Resolving localhost url");
            var hostEntry = Dns.GetHostEntryAsync("localhost").GetResult();
            var localhostIp = hostEntry.AddressList.First(addr => addr.AddressFamily == AddressFamily.InterNetwork);
            var port = (int)_options.Port;
            _host = new WebHostBuilder()
                .UseKestrel(serverOptions =>
                {
                    if (_certificate != null)
                        serverOptions.Listen(localhostIp, port, o => o.UseHttps(_certificate));
                    else
                        serverOptions.Listen(localhostIp, port);
                })
                .SuppressStatusMessages(true)
                .UseContentRoot(Directory.GetCurrentDirectory())
                .Configure(Configure)
                .Build();

            Log.Trace($"Starting server host: {_protocol}://{localhostIp}:{port}");
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

            foreach (var pair in _options.StaticFileMappings)
            {
                if (!Directory.Exists(pair.Value))
                {
                    continue;
                }

                app.UseStaticFiles(new StaticFileOptions
                {
                    RequestPath = pair.Key,
                    FileProvider = new PhysicalFileProvider(pair.Value)
                });
            }

            app.Use(async (context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    var urlPath = context.Request.Path.ToString().TrimEnd('/');
                    if (_options.StaticFileMappings.TryGetValue(urlPath, out var physicalPath))
                    {
                        if (File.Exists(physicalPath))
                        {
                            using (var webSocket = await context.WebSockets.AcceptWebSocketAsync().ConfigureAwait(false))
                            {
                                using (var stream = File.Open(physicalPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                                using (var streamReader = new StreamReader(stream))
                                {
                                    var bytes = Encoding.UTF8.GetBytes(
                                        await streamReader.ReadToEndAsync().ConfigureAwait(false));
                                    await webSocket
                                        .SendAsync(
                                            new ArraySegment<byte>(bytes),
                                            WebSocketMessageType.Text,
                                            true,
                                            CancellationToken.None)
                                        .ConfigureAwait(false);
                                }

                                await webSocket
                                    .CloseAsync(
                                        WebSocketCloseStatus.NormalClosure,
                                        "Normal Close",
                                        CancellationToken.None)
                                    .ConfigureAwait(false);
                            }

                            return;
                        }                        
                    }

                    if (string.IsNullOrEmpty(urlPath))
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

                        return;
                    }

                    Log.Trace("Unknown websocket request received: {0}", context.Request.Path);
                }
                else
                {
                    Log.Trace("Unknown request received: {0}", context.Request.Path);
                }
                await next().ConfigureAwait(false);
            });
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
