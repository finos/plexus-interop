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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Client
{
    using Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal;
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class WebSocketTransmissionClient : ITransmissionClient
    {
        private const string ServerName = "ws-v1";
        private static readonly TimeSpan MaxServerInitializationTime = TimeSpan.FromSeconds(20);

        private static readonly ILogger Log = LogManager.GetLogger<WebSocketTransmissionClient>();

        private readonly CancellationToken _cancellationToken;
        private readonly IServerStateReader _serverStateReader;

        public WebSocketTransmissionClient(
            string brokerWorkingDir, 
            CancellationToken cancellationToken = default)
        {
            _cancellationToken = cancellationToken;
            _serverStateReader = new ServerStateReader(ServerName, brokerWorkingDir);
        }

        public async ValueTask<ITransmissionConnection> ConnectAsync(CancellationToken cancellationToken = default)
        {
            using (var cancellation =
                CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, _cancellationToken))
            {
                return await ConnectInternalAsync(cancellation.Token).ConfigureAwait(false);
            }
        }

        private async ValueTask<ITransmissionConnection> ConnectInternalAsync(CancellationToken cancellationToken = default)
        {
            if (!await _serverStateReader
                .WaitInitializationAsync(MaxServerInitializationTime, cancellationToken)
                .ConfigureAwait(false))
            {
                throw new TimeoutException(
                    $"Timeout ({MaxServerInitializationTime.TotalSeconds}sec) while waiting for server \"{ServerName}\" availability");
            }
            var url = _serverStateReader.ReadSetting("address");
            if (string.IsNullOrEmpty(url))
            {
                throw new InvalidOperationException("Cannot find url to connect");
            }
            Log.Trace("Creating new connection to url {0}", url);
            var connection = new WebSocketTransmissionClientConnection(url, _cancellationToken);
            await connection.ConnectCompletion.ConfigureAwait(false);
            Log.Trace("Created new connection {0} to url {1}", connection.Id, url);
            return connection;
        }
    }
}
