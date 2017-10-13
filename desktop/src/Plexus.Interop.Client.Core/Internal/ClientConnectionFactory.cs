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
namespace Plexus.Interop.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Transport;
    using System;
    using System.Threading.Tasks;

    internal sealed class ClientConnectionFactory
    {
        public static readonly ClientConnectionFactory Instance = new ClientConnectionFactory();

        private static readonly ILogger Log = LogManager.GetLogger<ClientConnectionFactory>();

        public async Task<IClientConnection> ConnectAsync(ClientOptions options)
        {
            Log.Trace("Establishing new connection with broker");
            ITransportConnection transportConnection = null;
            try
            {
                transportConnection = await options.Transport.ConnectAsync();
                Log.Debug("Connection {0} established. Performing handshake: {1}", transportConnection.Id, options);
                var channel = await transportConnection.CreateChannelAsync().ConfigureAwait(false);
                var protocolSerializer = options.Protocol.Serializer;
                using (var connectRequest = options.Protocol.MessageFactory.CreateConnectRequest(options.ApplicationId, options.ApplicationInstanceId))
                {
                    var serializedRequest = protocolSerializer.Serialize(connectRequest);
                    try
                    {
                        await channel.Out.WriteAsync(new TransportMessageFrame(serializedRequest)).ConfigureAwait(false);
                        channel.Out.TryComplete();
                    }
                    catch
                    {
                        serializedRequest.Dispose();
                        throw;
                    }
                }
                Log.Trace("Connection {0} receiving connection response.", transportConnection.Id);
                using (var serializedResponse = await channel.In.ReadAsync().ConfigureAwait(false))
                using (var connectResponse = protocolSerializer.DeserializeConnectResponse(serializedResponse.Payload))
                {
                    await channel.Completion.ConfigureAwait(false);
                    Log.Debug("Successfully authenticated: {0}", connectResponse);
                    return new ClientConnection(connectResponse.ConnectionId, transportConnection);
                }

            }
            catch (Exception ex)
            {
                if (transportConnection != null)
                {
                    Log.Error("Connection failed {0}", transportConnection);
                }
                else
                {
                    Log.Warn(ex, "Connection failed");
                }
                throw;
            }
        }
    }
}
