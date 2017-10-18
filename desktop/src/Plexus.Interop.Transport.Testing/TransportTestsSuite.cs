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
namespace Plexus.Interop.Transport
{
    using Plexus.Channels;
    using Shouldly;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Xunit;
    using Xunit.Abstractions;

    public abstract class TransportTestsSuite : TestsSuite
    {
        protected abstract ITransportServer Server { get; }

        protected abstract ITransportClient Client { get; }

        protected TransportTestsSuite(ITestOutputHelper output) : base(output)
        {
        }

        public sealed class ChannelExchange : IXunitSerializable
        {
            public ChannelExchange()
            {
            }

            public ChannelExchange(int[] incomingMessageLengths, int[] outcomingMessageLengths)
            {
                ServerMessageLengths = incomingMessageLengths;
                ClientMessageLengths = outcomingMessageLengths;
            }

            public int[] ServerMessageLengths { get; set; }
            public int[] ClientMessageLengths { get; set; }

            public void Deserialize(IXunitSerializationInfo info)
            {
                ServerMessageLengths = info.GetValue<int[]>(nameof(ServerMessageLengths));
                ClientMessageLengths = info.GetValue<int[]>(nameof(ClientMessageLengths));
            }

            public void Serialize(IXunitSerializationInfo info)
            {
                info.AddValue(nameof(ServerMessageLengths), ServerMessageLengths);
                info.AddValue(nameof(ClientMessageLengths), ClientMessageLengths);
            }

            public override string ToString()
            {
                return $"{{[{string.Join(", ", ServerMessageLengths)}], [{string.Join(",", ClientMessageLengths)}]}}";
            }
        }        

        [Fact]
        public void DisposeFromServerSide()
        {
            RunWith10SecTimeout(async () =>
            {
                await Server.StartAsync();
                using (var clientConnection = await Client.ConnectAsync())
                using (var serverConnection = await Server.In.ReadAsync())
                {
                    serverConnection.Dispose();

                    Should.Throw<OperationCanceledException>(serverConnection.Completion, Timeout1Sec);
                    Should.Throw<OperationCanceledException>(clientConnection.Completion, Timeout1Sec);
                }
            });
        }

        [Fact]
        public void DisposeFromClientSide()
        {
            RunWith10SecTimeout(async () =>
            {
                await Server.StartAsync();
                using (var clientConnection = await Client.ConnectAsync())
                using (var serverConnection = await Server.In.ReadAsync())
                {
                    clientConnection.Dispose();
                    
                    Should.Throw<OperationCanceledException>(clientConnection.Completion, Timeout1Sec);
                    Should.Throw<OperationCanceledException>(serverConnection.Completion, Timeout1Sec);
                }
            });
        }

        [Fact]
        public void DisconnectFromClientSide()
        {
            RunWith10SecTimeout(async () =>
            {
                await Server.StartAsync();
                using (var clientConnection = await Client.ConnectAsync())
                using (var serverConnection = await Server.In.ReadAsync())
                {
                    clientConnection.TryTerminate();
                    Should.Throw<OperationCanceledException>(clientConnection.Completion, Timeout1Sec);
                    WriteLog("Client completed");
                    Should.Throw<OperationCanceledException>(serverConnection.Completion, Timeout1Sec);
                    WriteLog("Server completed");                    
                }
            });
        }

        [Fact]
        public void DisconnectFromServerSide()
        {
            RunWith10SecTimeout(async () =>
            {
                await Server.StartAsync();
                using (var clientConnection = await Client.ConnectAsync())
                using (var serverConnection = await Server.In.ReadAsync())
                {
                    serverConnection.TryTerminate();
                    Should.Throw<OperationCanceledException>(serverConnection.Completion, Timeout1Sec);
                    WriteLog("Server completed");
                    Should.Throw<OperationCanceledException>(clientConnection.Completion, Timeout1Sec);
                    WriteLog("Client completed");
                }
            });
        }

        [Fact]
        public void TerminateChannelFromClientSide()
        {
            RunWith10SecTimeout(
                async () =>
                {
                    await Server.StartAsync().ConfigureAwait(false);
                    using (var clientConnection = RegisterDisposable(await Client.ConnectAsync().ConfigureAwait(false)))
                    using (var serverConnection = RegisterDisposable(await Server.In.ReadAsync().ConfigureAwait(false)))
                    {
                        var clientChannel = await clientConnection.CreateChannelAsync().ConfigureAwait(false);
                        var serverChannel = await serverConnection.IncomingChannels.ReadAsync().ConfigureAwait(false);
                        WriteLog("Terminating client channel");
                        clientChannel.Out.TryTerminateWriting();
                        clientChannel.Out.Completion.IsCanceled.ShouldBe(true);
                        Should.Throw<OperationCanceledException>(() => clientChannel.Completion, Timeout1Sec);
                        WriteLog("Client channel terminated");
                        Should.Throw<OperationCanceledException>(() => serverChannel.Completion, Timeout1Sec);
                        WriteLog("Server channel terminated");
                    }
                });
        }

        [Fact]
        public void TerminateChannelFromServerSide()
        {
            RunWith10SecTimeout(
                async () =>
                {
                    await Server.StartAsync().ConfigureAwait(false);
                    var serverConnectionTask = Server.In.ReadAsync();
                    var clientConnection = RegisterDisposable(await Client.ConnectAsync().ConfigureAwait(false));
                    var serverConnection = RegisterDisposable(await serverConnectionTask.ConfigureAwait(false));
                    var clientChannel = await clientConnection.CreateChannelAsync().ConfigureAwait(false);
                    var serverChannel = await serverConnection.IncomingChannels.ReadAsync().ConfigureAwait(false);
                    serverChannel.Out.TryTerminateWriting();
                    Should.Throw<OperationCanceledException>(() => clientChannel.Completion, Timeout1Sec);
                    Should.Throw<OperationCanceledException>(() => serverChannel.Completion, Timeout1Sec);
                });
        }

        [Fact]
        public void ShouldNotBePossibleCreateChannelOnClientSideAfterConnectionTerminatedOnServerSide()
        {
            RunWith10SecTimeout(
                async () =>
                {
                    await Server.StartAsync();
                    var serverConnectionTask = Server.In.ReadAsync();
                    var clientConnection = RegisterDisposable(await Client.ConnectAsync().ConfigureAwait(false));
                    var serverConnection = RegisterDisposable(await serverConnectionTask.ConfigureAwait(false));
                    serverConnection.TryTerminate();
                    Should.Throw<OperationCanceledException>(clientConnection.Completion, Timeout1Sec);
                    Should.Throw<OperationCanceledException>(clientConnection.CreateChannelAsync().AsTask(), Timeout1Sec);
                });
        }

        [Fact]
        public void ShouldNotBePossibleCreateChannelOnClientSideAfterConnectionTerminated()
        {
            RunWith10SecTimeout(
                async () =>
                {
                    await Server.StartAsync().ConfigureAwait(false);                    
                    var clientConnection = await Client.ConnectAsync();
                    var serverConnection = await Server.In.ReadAsync();
                    clientConnection.TryTerminate();
                    Should.Throw<OperationCanceledException>(clientConnection.CreateChannelAsync().AsTask(), Timeout1Sec);
                    Should.Throw<OperationCanceledException>(clientConnection.Completion, Timeout1Sec);
                });
        }

        public static TheoryData<ChannelExchange[]> SendMessagesInBothDirectionsTestCases =
            new TheoryData<ChannelExchange[]>
            {
                    new ChannelExchange[] { },
                    new ChannelExchange[] {
                        new ChannelExchange(new int[] { }, new int[] { }),
                        new ChannelExchange(new int[] { }, new int[] { })
                    },
                    new ChannelExchange[] { new ChannelExchange(new[] { 3 }, new int[] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { }, new [] { 3 }) },
                    new ChannelExchange[] { new ChannelExchange(new [] { 3 }, new [] { 3 }) },
                    new ChannelExchange[] { new ChannelExchange(new [] { 3, 5, 1 }, new int [] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int [] { }, new [] { 3, 5, 1 }) },
                    new ChannelExchange[] { new ChannelExchange(new int [] { }, new int [] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 0 }, new int [] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { }, new int [] { 0 }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { }, new int [] { 5, 0, 10 }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 5, 0, 10 }, new int [] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 65000 }, new int [] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { }, new int [] { 65000 }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 65000 }, new int [] { 65000 }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 65001 }, new int [] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { }, new int [] { 65001 }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 65001 }, new int [] { 65001 }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 1024*1024*5 }, new int [] { }) },
                    new ChannelExchange[] { new ChannelExchange(new int[] { 1024*1024*5, 65001, 0, 65001 }, new int [] { 1024 * 1024 * 5, 65001, 0, 65001 }) },
                    new ChannelExchange[] {
                        new ChannelExchange(new int[] { 1024*1024*5, 65001, 0, 65001 }, new int [] { 1024 * 1024 * 5, 65001, 0, 65001 }),
                        new ChannelExchange(new int[] { 1024*1024*5, 65001, 0, 65001 }, new int [] { 1024 * 1024 * 5, 65001, 0, 65001 }),
                        new ChannelExchange(new int[] { 1024*1024*5, 65001, 0, 65001 }, new int [] { 1024 * 1024 * 5, 65001, 0, 65001 }),
                        new ChannelExchange(new int[] { 1024*1024*5, 65001, 0, 65001 }, new int [] { 1024 * 1024 * 5, 65001, 0, 65001 }),
                        new ChannelExchange(new int[] { 1024*1024*5, 65001, 0, 65001 }, new int [] { 1024 * 1024 * 5, 65001, 0, 65001 }),
                    },
                    new ChannelExchange[] {
                        new ChannelExchange(new int[] { 1024*1024, 65001, 0, 65001 }, new int [] { 1024 * 1024, 0, 65001, 0, 1, 2, 3, 4, 5 }),
                        new ChannelExchange(new int[] { }, new int [] { 1024 * 1024, 0, 65001, 0 }),
                        new ChannelExchange(new int[] { 1024*1024, 0, 65001 }, new int [] { })
                    },
                    new ChannelExchange[] {
                        new ChannelExchange(new int[] { 1, 2, 3}, new int [] { 1, 0, 1, 2, 3, 4, 5, 6, 7, 8 }),
                        new ChannelExchange(new int[] { }, new int [] { 3, 0, 3, 0 }),
                    },
                    new ChannelExchange[] {
                        new ChannelExchange(new int[] { 1024*1024, 65001, 0, 65001 }, new int [] { 1024 * 1024, 0, 65001, 0, 1, 2, 3, 4, 5 }),
                    },
            };

        [Theory]
        [MemberData(nameof(SendMessagesInBothDirectionsTestCases))]
#pragma warning disable xUnit1026 // Theory methods should use all of their parameters
        public void SendMessagesInBothDirections(ChannelExchange[] cases)
#pragma warning restore xUnit1026 // Theory methods should use all of their parameters
        {
            var serverSentMessageHashes = new List<List<byte[]>>();
            var serverReceivedMessageHashes = new List<List<byte[]>>();
            var clientSentMessageHashes = new List<List<byte[]>>();
            var clientReceivedMessageHashes = new List<List<byte[]>>();

            async Task HandleChannelAsync(ITransportChannel c, int[] send, List<byte[]> received, List<byte[]> sent)
            {
                Log.Info("Handling channel {0}", c.Id);
                var receiveTask = TaskRunner.RunInBackground(
                        async () =>
                        {
                            while (true)
                            {
                                var receivedMsg = await c.TryReceiveMessageAsync().ConfigureAwait(false);
                                if (!receivedMsg.HasValue)
                                {
                                    break;
                                }
                                lock (Md5)
                                {
                                    received.Add(Md5.ComputeHash(receivedMsg.Value));
                                }
                            }
                        });
                foreach (var length in send)
                {
                    var msg = Random.GetRandomBytes(length);
                    await c.SendMessageAsync(msg).ConfigureAwait(false);
                    lock (Md5)
                    {
                        sent.Add(Md5.ComputeHash(msg));
                    }
                }
                c.Out.TryCompleteWriting();
                await receiveTask.ConfigureAwait(false);
                Log.Info("Channel handling completed {0}. Received {1} messages.", c.Id, received.Count);
            }

            ITransportConnection clientConnection = null;
            ITransportConnection serverConnection = null;
            var serverTask = TaskRunner.RunInBackground(
                async () =>
                {
                    await Server.StartAsync().ConfigureAwait(false);
                    serverConnection = await Server.In.ReadAsync().ConfigureAwait(false);
                    Log.Info("Server connection created");
                    var channelTasks = new List<Task>();
                    foreach (var channelExchange in cases)
                    {
                        var channel = await serverConnection.CreateChannelAsync().ConfigureAwait(false);
                        Log.Info("Server channel created");
                        var rec = new List<byte[]>();
                        var sent = new List<byte[]>();
                        clientReceivedMessageHashes.Add(rec);
                        clientSentMessageHashes.Add(sent);
                        channelTasks.Add(TaskRunner.RunInBackground(() =>
                            HandleChannelAsync(channel, channelExchange.ClientMessageLengths, rec, sent)));
                    }
                    await Task.WhenAll(channelTasks).ConfigureAwait(false);
                });

            var clientTask = TaskRunner.RunInBackground(
                async () =>
                {
                    clientConnection = await Client.ConnectAsync().ConfigureAwait(false);
                    Log.Info("Client connection created");
                    var channelTasks = new List<Task>();
                    foreach (var channelExchange in cases)
                    {
                        var channel = await clientConnection.IncomingChannels.ReadAsync().ConfigureAwait(false);
                        Log.Info("Client channel received");
                        var rec = new List<byte[]>();
                        var sent = new List<byte[]>();
                        serverReceivedMessageHashes.Add(rec);
                        serverSentMessageHashes.Add(sent);
                        channelTasks.Add(TaskRunner.RunInBackground(() => HandleChannelAsync(channel, channelExchange.ServerMessageLengths, rec, sent)));
                    }
                    await Task.WhenAll(channelTasks).ConfigureAwait(false);
                });

            Should.CompleteIn(Task.WhenAll(serverTask, clientTask), TimeSpan.FromSeconds(10));
            Should.CompleteIn(clientConnection.CompleteAsync(), Timeout1Sec);
            Should.CompleteIn(serverConnection.CompleteAsync(), Timeout1Sec);

            Log.Debug("Tasks completed");
            serverReceivedMessageHashes.Count.ShouldBe(cases.Length);
            serverSentMessageHashes.Count.ShouldBe(cases.Length);
            clientReceivedMessageHashes.Count.ShouldBe(cases.Length);
            clientSentMessageHashes.Count.ShouldBe(cases.Length);
            for (int i = 0; i < serverReceivedMessageHashes.Count; i++)
            {
                serverReceivedMessageHashes[i].Count.ShouldBe(clientSentMessageHashes[i].Count);
                for (int j = 0; j < serverReceivedMessageHashes[i].Count; j++)
                {
                    serverReceivedMessageHashes[i][j].ShouldBe(clientSentMessageHashes[i][j]);
                }
            }
            for (int i = 0; i < clientReceivedMessageHashes.Count; i++)
            {
                clientReceivedMessageHashes[i].Count.ShouldBe(serverSentMessageHashes[i].Count);
                for (int j = 0; j < clientReceivedMessageHashes[i].Count; j++)
                {
                    clientReceivedMessageHashes[i][j].ShouldBe(serverSentMessageHashes[i][j]);
                }
            }
        }
    }
}
