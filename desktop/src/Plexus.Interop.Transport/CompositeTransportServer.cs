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
﻿namespace Plexus.Interop.Transport
{
    using Plexus.Channels;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class CompositeTransportServer : StartableBase, IReadableChannel<ITransportConnection>
    {
        private static readonly ILogger Log = LogManager.GetLogger<CompositeTransportServer>();

        private readonly IReadOnlyCollection<ITransportServer> _servers;

        private readonly IChannel<ITransportConnection> _buffer = new BufferedChannel<ITransportConnection>(3);

        public CompositeTransportServer(IEnumerable<ITransportServer> servers)
        {
            _servers = servers.ToList();
        }

        protected override async Task<Task> StartProcessAsync(CancellationToken stopCancellationToken)
        {
            Log.Debug("Starting");
            using (stopCancellationToken.Register(OnStop))
            {
                var startTasks = _servers.Select(x => TaskRunner.RunInBackground(x.StartAsync, stopCancellationToken)).ToArray();
                await Task.WhenAll(startTasks).IgnoreExceptions().ConfigureAwait(false);
            }
            return ProcessAsync(stopCancellationToken);
        }

        private async Task ProcessAsync(CancellationToken cancellationToken)
        {
            using (cancellationToken.Register(OnStop))
            {
                await Task.WhenAll(_servers.Select(x => ProcessAsync(x, cancellationToken))).IgnoreExceptions();
            }
            _buffer.Out.TryComplete();
        }

        private void OnStop()
        {
            Log.Debug("Stopping");
            foreach (var server in _servers)
            {
                server.StopAsync().IgnoreAwait(Log, "Exception on stopping server {0}", server);
            }
        }

        private async Task ProcessAsync(ITransportServer server, CancellationToken cancellationToken)
        {
            try
            {
                while (true)
                {
                    var connection = await server.CreateAsync(cancellationToken).ConfigureAwait(false);
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
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception while server listening {0}", server);
            }
            Log.Debug("Server listening stopped: {0}", server);
        }

        public Task<bool> WaitForNextSafeAsync()
        {
            return _buffer.In.WaitForNextSafeAsync();
        }

        public bool TryReadSafe(out ITransportConnection item)
        {
            return _buffer.In.TryReadSafe(out item);
        }
    }
}
