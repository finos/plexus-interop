/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Apps.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Apps;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    internal sealed class AppConnection : IAppConnection
    {
        private readonly ILogger _log;
        private readonly ITransportConnection _connection;

        public AppConnection(ITransportConnection connection, AppConnectionDescriptor appInfo)
        {
            Id = connection.Id;
            _log = LogManager.GetLogger<AppConnection>(Id.ToString());
            Info = appInfo;
            _connection = connection;
            Completion = ProcessAsync();
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

        public UniqueId Id { get; }

        public AppConnectionDescriptor Info { get; }

        public Task Completion { get; }

        public IReadableChannel<ITransportChannel> IncomingChannels => _connection.IncomingChannels;

        public async ValueTask<ITransportChannel> CreateChannelAsync()
        {
            return await _connection.CreateChannelAsync().ConfigureAwait(false);
        }

        public override bool Equals(object obj)
        {
            return obj is AppConnection connection &&
                   EqualityComparer<AppConnectionDescriptor>.Default.Equals(Info, connection.Info);
        }

        public override int GetHashCode()
        {
            return 1340155117 + EqualityComparer<AppConnectionDescriptor>.Default.GetHashCode(Info);
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
