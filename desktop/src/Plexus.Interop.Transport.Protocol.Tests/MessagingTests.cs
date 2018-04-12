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
namespace Plexus.Interop.Transport.Protocol
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol.Common;
    using Plexus.Interop.Transport.Protocol.Protobuf;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using Plexus.Interop.Transport.Transmission.Pipes;
    using Plexus.Pools;
    using Shouldly;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using Xunit;

    public sealed class MessagingTests : TestsSuite
    {
        private static readonly ITransportProtocolSerializationProvider SerializationProvider 
            = new ProtobufTransportProtocolSerializationProvider();

        private static readonly string BrokerWorkingDir = Directory.GetCurrentDirectory();

        private readonly ITransmissionServer _server;
        private readonly ITransmissionClient _client;        

        public MessagingTests()
        {
            _server = RegisterDisposable(PipeTransmissionServerFactory.Instance.Create(BrokerWorkingDir));
            _server.StartAsync().GetResult();
            _client = PipeTransmissionClientFactory.Instance.Create();
        }

        private static IEnumerable<TransportMessage> GenerateAllTransportMessages()
        {
            yield return new TransportMessage(TransportHeaderPool.Instance.CreateConnectionOpenHeader(UniqueId.Generate()));
            yield return new TransportMessage(TransportHeaderPool.Instance.CreateChannelOpenHeader(UniqueId.Generate()));
            yield return new TransportMessage(
                TransportHeaderPool.Instance.CreateFrameHeader(UniqueId.Generate(), true, 3),
                new Maybe<IPooledBuffer>(PooledBuffer.Get(new byte[] { 1, 2, 3 })));
            yield return new TransportMessage(
                TransportHeaderPool.Instance.CreateChannelCloseHeader(
                    UniqueId.Generate(),
                    new CompletionHeader(CompletionStatusHeader.Canceled, Nothing.Instance)));
            yield return new TransportMessage(
                TransportHeaderPool.Instance.CreateConnectionCloseHeader(
                    new CompletionHeader(
                        CompletionStatusHeader.Failed,
                        new ErrorHeader("Error message", "Error details"))));
        }

        [Fact]
        public void SendTransportMessageFromClientToServer()
        {
            RunWith10SecTimeout(async () =>
            {
                using (var clientConnection = await _client.ConnectAsync(BrokerWorkingDir))
                using (var serverConnection = await _server.In.ReadAsync())
                {
                    var clientSender = new MessagingSendProcessor(clientConnection, SerializationProvider.GetSerializer());
                    var serverReceiver = new MessagingReceiveProcessor(serverConnection, SerializationProvider.GetDeserializer(TransportHeaderPool.Instance));
                    var connectionOpen = new TransportMessage(TransportHeaderPool.Instance.CreateConnectionOpenHeader(UniqueId.Generate()));
                    var connectionClose = new TransportMessage(TransportHeaderPool.Instance.CreateConnectionCloseHeader(CompletionHeader.Completed));
                    await clientSender.Out.WriteAsync(connectionOpen);
                    await clientSender.Out.WriteAsync(connectionClose);
                    clientSender.Out.TryComplete();

                    var received1 = await serverReceiver.In.ReadAsync();
                    var received2 = await serverReceiver.In.ReadAsync();

                    Should.CompleteIn(serverReceiver.In.Completion, Timeout1Sec);
                    received1.Header.ShouldBeAssignableTo<ITransportConnectionOpenHeader>();
                    received2.Header.ShouldBeAssignableTo<ITransportConnectionCloseHeader>();                    
                }
            });
        }

        [Fact]
        public void CanSendMessagesOfAllTypes()
        {
            var received = new List<TransportMessage>();
            var serverTask = RunReceiverTaskAsync(() => _server.In.ReadAsync(), async receiver =>
            {
                while (true)
                {
                    var maybeMessage = await receiver.In.TryReadAsync().ConfigureAwait(false);
                    if (!maybeMessage.HasValue)
                    {
                        Log.Trace("Receving terminated for stream {0}", receiver.Id);
                        break;
                    }
                    Log.Trace("Received message from stream {0}: {1}", receiver.Id, maybeMessage.Value);
                    received.Add(maybeMessage.Value);
                }
                await receiver.In.Completion.ConfigureAwait(false);
            });

            var testMessages = GenerateAllTransportMessages().ToArray();

            var clientTask = RunSenderTaskAsync(() => _client.ConnectAsync(BrokerWorkingDir), async sender =>
            {
                foreach (var transportMessage in testMessages)
                {
                    transportMessage.Retain();
                    await sender.Out.WriteAsync(transportMessage).ConfigureAwait(false);
                }
                sender.Out.TryComplete();
                await sender.Out.Completion.ConfigureAwait(false);
            });

            Should.CompleteIn(Task.WhenAll(clientTask, serverTask), Timeout1Sec);

            received.Count.ShouldBe(5);
            using (var enumerator = received.GetEnumerator())
            {
                foreach (var expected in testMessages)
                {
                    using (expected)
                    {
                        enumerator.MoveNext().ShouldBe(true);
                        using (var actual = enumerator.Current)
                        {
                            actual.Header.ShouldBe(expected.Header);
                            actual.Payload.HasValue.ShouldBe(expected.Payload.HasValue);
                            if (expected.Payload.HasValue)
                            {
                                var actualPayload = actual.Payload.Value.ToArray();
                                var expectedPayload = expected.Payload.Value.ToArray();
                                actualPayload.ShouldBe(expectedPayload);
                            }
                        }
                    }
                }
            }
        }

        [Fact]
        public void StreamFailure()
        {
            var receiverTask = TaskRunner.RunInBackground(async () =>
            {
                MessagingReceiveProcessor receiver;
                using (var connection = await _server.In.ReadAsync().ConfigureAwait(false))
                {
                    receiver = new MessagingReceiveProcessor(connection, SerializationProvider.GetDeserializer(TransportHeaderPool.Instance));
                    await receiver.In.TryReadAsync().ConfigureAwait(false);
                }
                await receiver.In.ConsumeAsync(x => x.Dispose()).ConfigureAwait(false);
            });

            var senderTask = TaskRunner.RunInBackground(async () =>
            {
                MessagingSendProcessor sender;
                using (var clientStream = await _client.ConnectAsync(BrokerWorkingDir).ConfigureAwait(false))
                {
                    sender = new MessagingSendProcessor(clientStream, SerializationProvider.GetSerializer());
                    var result = true;
                    while (result)
                    {
                        var transportMessage = new TransportMessage(
                            TransportHeaderPool.Instance.CreateFrameHeader(UniqueId.Generate(), true, 64),
                            new Maybe<IPooledBuffer>(PooledBuffer.Get(Random.GetRandomBytes(64))));
                        result = await sender.Out.TryWriteAsync(transportMessage).ConfigureAwait(false);
                    }
                }
                Log.Trace("Awaiting completion of sender {0}", sender.Id);
                await sender.Out.Completion.ConfigureAwait(false);
            });
            Should.Throw<OperationCanceledException>(receiverTask, Timeout1Sec);
            Should.Throw<Exception>(senderTask, Timeout1Sec);
            Log.Trace(senderTask.Exception.ExtractInner(), "Received exception on sending");
        }

        private Task RunReceiverTaskAsync(Func<ValueTask<ITransmissionConnection>> connectionFactory, Func<IMessagingReceiveProcessor, Task> action)
        {
            return TaskRunner.RunInBackground(async () =>
            {
                using (var connection = await connectionFactory().ConfigureAwait(false))
                {
                    var receiver = new MessagingReceiveProcessor(connection, SerializationProvider.GetDeserializer(TransportHeaderPool.Instance));
                    await action(receiver).ConfigureAwait(false);
                    await receiver.In.Completion.ConfigureAwait(false);
                    Log.Trace("Completing server stream for connection {0}", connection.Id);
                    connection.Out.TryComplete();
                    await connection.Completion.ConfigureAwait(false);
                }
            });
        }

        private Task RunSenderTaskAsync(Func<ValueTask<ITransmissionConnection>> connectionFactory, Func<IMessagingSendProcessor, Task> action)
        {
            return TaskRunner.RunInBackground(async () =>
            {
                using (var connection = await connectionFactory().ConfigureAwait(false))
                {
                    var sender = new MessagingSendProcessor(connection, SerializationProvider.GetSerializer());
                    await action(sender).ConfigureAwait(false);
                    sender.Out.TryComplete();
                    await sender.Out.Completion.ConfigureAwait(false);
                    Log.Trace("Waiting for completion of connection {0}", connection.Id);
                    await connection.Completion.ConfigureAwait(false);
                }
            });
        }
    }
}