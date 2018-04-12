/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Protocol.Protobuf
{
    using Plexus.Interop.Protocol.Invocation;
    using System;
    using Shouldly;
    using Xunit;

    public sealed class ProtobufSerializerTests : TestsSuite
    {
        private static readonly IProtocolMessageFactory MessageFactory = ProtocolMessagePool.Instance;

        private static readonly ProtobufProtocolSerializerFactory SerializerFactory =
            new ProtobufProtocolSerializerFactory();

        [Fact]
        public void InvocationStartRequestSerialization()
        {
            var serializer = SerializerFactory.Create(MessageFactory);
            using (var request = MessageFactory.CreateInvocationStartRequest("plexus.interop.testing.EchoService", "Unary"))
            using (var serialized = serializer.Serialize(request))
            using (var deserialized = serializer.DeserializeClientToBrokerRequest(serialized))
            {
                deserialized.Handle(new ClientToBrokerRequestHandler<Nothing, Nothing>(
                    (msg, _) =>
                    {
                        return msg.Target.Handle(new InvocationTargetHandler<Nothing, Nothing>(
                                (target, __) =>
                                {
                                    target.MethodId.ShouldBe("Unary");
                                    target.ConsumedService.ServiceId.ShouldBe("plexus.interop.testing.EchoService");
                                    target.ConsumedService.ServiceAlias.ShouldBe(Maybe<string>.Nothing);
                                    return Nothing.Instance;
                                },
                            (target, __) => throw new InvalidOperationException($"Unexpected target: {target}")));
                    },
                    (msg, _) => throw new InvalidOperationException($"Unexpected message: {msg}"),
                    (msg, _) => throw new InvalidOperationException($"Unexpected message: {msg}")));
            }
        }
    }
}
