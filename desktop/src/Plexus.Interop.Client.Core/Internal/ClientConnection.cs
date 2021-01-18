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
    using Plexus.Channels;
    using Plexus.Interop.Transport;
    using System;
    using System.Threading.Tasks;

    internal sealed class ClientConnection : IClientConnection
    {
        private readonly ITransportConnection _transportConnection;

        public ClientConnection(UniqueId id, ITransportConnection transportConnection)
        {
            _transportConnection = transportConnection;
            Id = id;
        }

        public UniqueId Id { get; }

        public Task Completion => _transportConnection.Completion;

        public IReadableChannel<ITransportChannel> IncomingChannels => _transportConnection.IncomingChannels;

        public bool TryComplete()
        {
            return _transportConnection.TryComplete();
        }

        public bool TryTerminate(Exception ex = null)
        {
            return _transportConnection.TryTerminate(ex);
        }

        public ValueTask<Maybe<ITransportChannel>> TryCreateChannelSafeAsync()
        {
            return _transportConnection.TryCreateChannelSafeAsync();
        }

        public void Dispose()
        {
            _transportConnection.Dispose();
        }
    }
}
