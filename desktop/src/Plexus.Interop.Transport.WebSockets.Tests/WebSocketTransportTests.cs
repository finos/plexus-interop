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
namespace Plexus.Interop.Transport.WebSockets
{
    using Plexus.Interop.Transport.Protocol.Protobuf;
    using Plexus.Interop.Transport.Transmission.WebSockets.Client;
    using Plexus.Interop.Transport.Transmission.WebSockets.Server;
    using Xunit.Abstractions;

    public sealed class WebSocketTransportTests : TransportTestsSuite
    {
        public WebSocketTransportTests(ITestOutputHelper output) : base(output)
        {
            Server = RegisterDisposable(TransportServerFactory.Instance.Create(
                WebSocketTransmissionServerFactory.Instance.Create(BrokerWorkingDir),
                new ProtobufTransportProtocolSerializationProvider()));
            Client = TransportClientFactory.Instance.Create(
                new WebSocketTransmissionClient(),
                new ProtobufTransportProtocolSerializationProvider());
        }

        protected override ITransportServer Server { get; }

        protected override ITransportClient Client { get; }
    }
}
