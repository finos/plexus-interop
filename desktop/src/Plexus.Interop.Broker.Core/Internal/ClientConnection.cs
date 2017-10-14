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
 namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class ClientConnection : IClientConnection
    {
        private readonly ILogger _log;
        private readonly ITransportConnection _connection;

        public ClientConnection(ITransportConnection connection, ClientConnectionDescriptor clientInfo)
        {
            Id = connection.Id;
            _log = LogManager.GetLogger<ClientConnection>(Id.ToString());
            Info = clientInfo;
            _connection = connection;
            var listen = new ProducingChannel<ITransportChannel>(1, ListenAsync);
            IncomingChannels = listen;
            Completion = TaskRunner.RunInBackground(ProcessAsync);
        }

        private async Task ProcessAsync()
        {
            try
            {
                await IncomingChannels.Completion.ConfigureAwait(false);
                _connection.TryComplete();
            }
            catch (Exception ex)
            {
                _connection.TryTerminate(ex);
                throw;
            }
            finally
            {
                await _connection.Completion.ConfigureAwait(false);
            }
        }

        private async Task ListenAsync(IWriteOnlyChannel<ITransportChannel> output, CancellationToken cancellationToken)
        {
            while (true)
            {
                var result = await _connection.IncomingChannels.TryReadAsync().ConfigureAwait(false);
                if (!result.HasValue)
                {
                    break;
                }
                var channel = result.Value;
                _log.Trace("New invocation received: {0}", channel.Id);
                if (!await output.TryWriteAsync(channel).ConfigureAwait(false))
                {
                    channel.Out.TryTerminate();
                    break;
                }
            }
        }

        public UniqueId Id { get; }

        public ClientConnectionDescriptor Info { get; }

        public Task Completion { get; }

        public IReadOnlyChannel<ITransportChannel> IncomingChannels { get; }

        public async ValueTask<ITransportChannel> CreateChannelAsync()
        {
            return await _connection.CreateChannelAsync().ConfigureAwait(false);
        }

        public override bool Equals(object obj)
        {
            return obj is ClientConnection connection &&
                   EqualityComparer<ClientConnectionDescriptor>.Default.Equals(Info, connection.Info);
        }

        public override int GetHashCode()
        {
            return 1340155117 + EqualityComparer<ClientConnectionDescriptor>.Default.GetHashCode(Info);
        }

        public bool TryTerminate(Exception error = null)
        {
            return _connection.TryTerminate(error);
        }

        public bool TryComplete()
        {
            return _connection.TryComplete();
        }

        public override string ToString()
        {
            return Info.ToString();
        }
    }
}
