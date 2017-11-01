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
    using Plexus.Interop.Protocol.Connect;
    using Plexus.Interop.Transport;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps;
    using Plexus.Interop.Protocol;

    internal sealed class AuthenticationHandler : IAuthenticationHandler
    {
        private static readonly ILogger Log = LogManager.GetLogger<AuthenticationHandler>();

        private readonly IAppLifecycleManager _connectionTracker;        
        private readonly IConnectProtocolMessageFactory _messageFactory;
        private readonly IConnectProtocolSerializer _serializer;
        private readonly IRegistryService _registryService;

        public AuthenticationHandler(
            IAppLifecycleManager connectionTracker,
            IProtocolImplementation protocol,
            IRegistryService registryService)
        {
            _messageFactory = protocol.MessageFactory;
            _serializer = protocol.Serializer;
            _connectionTracker = connectionTracker;
            _registryService = registryService;
        }

        public async Task<IAppConnection> HandleAsync(ITransportConnection connection)
        {
            Log.Trace("Accepting new connection {0}", connection.Id);
            var channel = await connection.IncomingChannels.ReadAsync().ConfigureAwait(false);
            var frame = await channel.In.ReadAsync().ConfigureAwait(false);
            using (var payload = frame.Payload)
            using (var connectRequest = _serializer.DeserializeConnectRequest(payload))
            {
                if (!_registryService.IsApplicationDefined(connectRequest.ApplicationId))
                {
                    throw new BrokerException($"Connection rejected because application id is unknown to broker: {connectRequest.ApplicationId}");
                }
                using (var connectResponse = _messageFactory.CreateConnectResponse(connection.Id))
                {
                    var serializedResponse = _serializer.Serialize(connectResponse);
                    try
                    {
                        Log.Trace("Sending connect response ({0} bytes): {1}", connectResponse, serializedResponse.Count);
                        await channel.Out.WriteAsync(new TransportMessageFrame(serializedResponse)).ConfigureAwait(false);
                    }
                    catch
                    {
                        serializedResponse.Dispose();
                        throw;
                    }
                    channel.Out.TryComplete();
                    await channel.Completion.ConfigureAwait(false);
                    var info =
                        new AppConnectionDescriptor(
                            connectResponse.ConnectionId,
                            connectRequest.ApplicationId,
                            connectRequest.ApplicationInstanceId);
                    var clientConnection = _connectionTracker.AcceptConnection(connection, info);
                    Log.Info("New connection accepted: {0}", clientConnection);
                    return clientConnection;
                }
            }
        }
    }
}
