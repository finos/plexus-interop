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
namespace Plexus.Interop.Internal
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Plexus.Channels;
    using Plexus.Interop.Transport;
    using Plexus.Processes;

    internal sealed class ServerConnectionListener : ProcessBase
    {
        private readonly IReadOnlyCollection<ITransportServer> _servers;
        private readonly IChannel<ITransportConnection> _buffer = new BufferedChannel<ITransportConnection>(3);

        public ServerConnectionListener(IEnumerable<ITransportServer> servers)
        {
            _servers = servers.ToList();
        }

        public IReadableChannel<ITransportConnection> In => _buffer.In;

        protected override ILogger Log { get; } = LogManager.GetLogger<ServerConnectionListener>();

        protected override async Task<Task> StartCoreAsync()
        {
            var startTasks = _servers.Select(StartServerAsync).ToArray();
            await Task.WhenAll(startTasks).IgnoreExceptions().ConfigureAwait(false);
            var servers = startTasks.Where(t => t.Status == TaskStatus.RanToCompletion).Select(t => t.GetResult());
            OnStop(() => _buffer.Out.TryComplete());
            return ProcessAsync(servers);
        }

        private async Task<ITransportServer> StartServerAsync(ITransportServer server)
        {
            try
            {
                OnStop(server.Stop);
                await server.StartAsync().ConfigureAwait(false);
                return server;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Server failed to start: {{{0}}}", server);
                throw;
            }
        }

        private async Task ProcessAsync(IEnumerable<ITransportServer> servers)
        {
            await Task.WhenAll(servers.Select(ProcessAsync)).IgnoreExceptions().ConfigureAwait(false);
            Log.Debug("All servers stopped");
            _buffer.Out.TryComplete();
        }

        private async Task ProcessAsync(ITransportServer server)
        {
            try
            {
                await server.In.ConsumeAsync(ProcessAsync).ConfigureAwait(false);
                Log.Debug("Server completed: {{{0}}}", server);
            }
            catch (OperationCanceledException) when (CancellationToken.IsCancellationRequested)
            {
                Log.Debug("Server stopped: {{{0}}}", server);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception on server listening: {{{0}}}", server);
            }            
        }

        private async Task ProcessAsync(ITransportConnection connection)
        {
            try
            {
                await _buffer.Out.WriteAsync(connection).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                connection.TryTerminate(ex);
                throw;
            }
        }
    }
}
