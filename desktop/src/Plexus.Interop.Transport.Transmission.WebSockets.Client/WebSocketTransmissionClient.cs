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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Client
{
    using Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal;
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class WebSocketTransmissionClient : ITransmissionClient
    {
        private const string ServerName = "ws-v1";

        private static readonly TimeSpan MaxServerInitializationTime = TimeoutConstants.Timeout1Min;

        private static readonly ILogger Log = LogManager.GetLogger<WebSocketTransmissionClient>();

        public async ValueTask<ITransmissionConnection> ConnectAsync(string brokerWorkingDir, CancellationToken cancellationToken = default)
        {
            var webSocketAddress = EnvironmentHelper.GetWebSocketAddress();
            if (string.IsNullOrEmpty(webSocketAddress))
            {
                Log.Trace("Waiting initialization of server {0}", ServerName);
                var serverStateReader = new ServerStateReader(ServerName, brokerWorkingDir);
                if (!await serverStateReader
                    .WaitInitializationAsync(MaxServerInitializationTime, cancellationToken)
                    .ConfigureAwait(false))
                {
                    throw new TimeoutException(
                        $"Timeout ({MaxServerInitializationTime.TotalSeconds}sec) while waiting for server \"{ServerName}\" availability");
                }

                webSocketAddress = serverStateReader.ReadSetting("address");
            }

            if (string.IsNullOrEmpty(webSocketAddress))
            {
                throw new InvalidOperationException("Cannot find url to connect");
            }

            Log.Trace("Creating new connection to url {0}", webSocketAddress);
            var connection = new WebSocketClientTransmissionConnection(webSocketAddress);
            await connection.ConnectAsync(cancellationToken).ConfigureAwait(false);
            Log.Trace("Created new connection {0} to url {1}", connection.Id, webSocketAddress);
            return connection;
        }
    }
}
