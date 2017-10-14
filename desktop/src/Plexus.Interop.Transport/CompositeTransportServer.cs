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
 namespace Plexus.Interop.Transport
{
    using Plexus.Channels;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Processes;

    public sealed class CompositeTransportServer : ProcessBase, IReadOnlyChannel<ITransportConnection>
    {        
        private static readonly ILogger Log = LogManager.GetLogger<CompositeTransportServer>();

        private readonly IReadOnlyCollection<ITransportServer> _servers;
        private readonly IChannel<ITransportConnection> _buffer = new BufferedChannel<ITransportConnection>(3);

        public CompositeTransportServer(IEnumerable<ITransportServer> servers)
        {
            _servers = servers.ToList();
        }

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Debug("Starting");
            var startTasks = _servers.Select(x => TaskRunner.RunInBackground(x.StartAsync)).ToArray();
            await Task.WhenAll(startTasks).IgnoreExceptions().ConfigureAwait(false);
            return ProcessAsync();
        }

        private async Task ProcessAsync()
        {
            await Task.WhenAll(_servers.Select(ProcessAsync)).IgnoreExceptions();
            _buffer.Out.TryComplete();
        }

        private async Task ProcessAsync(ITransportServer server)
        {
            try
            {
                while (true)
                {
                    var result = await server.TryAcceptAsync().ConfigureAwait(false);
                    if (!result.HasValue)
                    {
                        break;
                    }
                    var connection = result.Value;
                    try
                    {
                        if (!await _buffer.Out.TryWriteAsync(connection).ConfigureAwait(false))
                        {
                            connection.TryTerminate();
                            break;
                        }
                    }
                    catch (Exception ex)
                    {
                        connection.TryTerminate(ex);
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception while server listening {0}", server);
            }
            Log.Debug("Server listening stopped: {0}", server);
        }

        public Task<bool> WaitReadAvailableAsync(CancellationToken cancellationToken = default)
        {
            return _buffer.In.WaitReadAvailableAsync(cancellationToken);
        }

        public bool TryRead(out ITransportConnection item)
        {
            return _buffer.In.TryRead(out item);
        }
    }
}
