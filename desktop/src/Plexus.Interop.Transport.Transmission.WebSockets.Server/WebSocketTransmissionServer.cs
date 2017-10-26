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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Server
{
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Hosting.Server.Features;
    using Microsoft.Extensions.DependencyInjection;
    using Plexus.Channels;
    using Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal;
    using Plexus.Processes;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Net.Sockets;
    using System.Net.WebSockets;
    using System.Threading.Tasks;

    public sealed class WebSocketTransmissionServer : ProcessBase, ITransmissionServer, IWebSocketHandler
    {        
        private const string ServerName = "ws-v1";

        private IWebHost _host;
        private readonly IChannel<ITransmissionConnection> _buffer = new BufferedChannel<ITransmissionConnection>(1);
        private readonly IServerStateWriter _stateWriter;

        public WebSocketTransmissionServer(string workingDir)
        {
            _stateWriter = new ServerStateWriter(ServerName, workingDir);
            _buffer.Out.PropagateCompletionFrom(Completion);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<WebSocketTransmissionServer>();

        public IReadOnlyChannel<ITransmissionConnection> In => _buffer.In;

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
                .UseStartup<WebSocketServer>()
                .ConfigureServices(Configure)
                .Build();
            Log.Trace("Starting server host: {0}", url);
            await _host.RunAsync(CancellationToken).ConfigureAwait(false);
        }

        public void Configure(IServiceCollection s)
        {
            s.AddSingleton<IWebSocketHandler>(this);
        }
    }
}
