/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop
{
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Protobuf;
    using Plexus.Interop.Transport;
    using Plexus.Interop.Transport.Protocol.Protobuf;
    using Plexus.Interop.Transport.Transmission.Pipes;

    public static class ClientOptionsBuilderExtensions
    {
        public static ClientOptionsBuilder WithDefaultConfiguration(this ClientOptionsBuilder builder)
        {
            return builder
                .WithMarshaller(
                    new ProtobufMarshallerProvider())
                .WithProtocol(
                    new ProtocolImplementation(
                        ProtocolMessagePool.Instance,
                        new ProtobufProtocolSerializerFactory()))
                .WithTransport(
                    TransportClientFactory.Instance.Create(
                        PipeTransmissionClientFactory.Instance.Create(),
                        new ProtobufTransportProtocolSerializationProvider()));
        }
    }
}
