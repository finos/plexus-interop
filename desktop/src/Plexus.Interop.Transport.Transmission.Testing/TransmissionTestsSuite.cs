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
namespace Plexus.Interop.Transport.Transmission
{
    using Plexus.Channels;
    using Plexus.Pools;
    using Shouldly;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Xunit;
    using Xunit.Abstractions;

    public abstract class TransmissionTestsSuite : TestsSuite
    {
        protected abstract ITransmissionServer CreateServer();
        protected abstract ITransmissionClient CreateClient();
        protected string BrokerWorkingDir { get; } = Directory.GetCurrentDirectory();

        protected TransmissionTestsSuite(ITestOutputHelper output) : base(output)
        {
        }

        [Fact]
        public void ConnectDisconnect()
        {
            RunWith5SecTimeout(async () =>
            {
                WriteLog("Starting server");
                using (var server = CreateServer())
                {
                    await server.StartAsync();
                    var serverConnectionTask = server.In.ReadAsync();
                    WriteLog("Connecting client");
                    var client = CreateClient();
                    using (await client.ConnectAsync(BrokerWorkingDir))
                    {
                        WriteLog("Client connected");
                        using (await serverConnectionTask)
                        {
                            WriteLog("Disposing server connection");
                        }
                        WriteLog("Disposing client connection");
                    }
                    WriteLog("Disposing server");
                }
            });
        }

        [Fact]
        public void ConcurrentConnect()
        {
            RunWith30SecTimeout(async () =>
            {
                WriteLog("Starting server");
                using (var server = CreateServer())
                {
                    await server.StartAsync();
                    WriteLog("Connecting clients");
                    const int concurrentClientsCount = 15;
                    var client = CreateClient();
                    var connectTasks = Enumerable
                        .Range(0, concurrentClientsCount)
                        .Select(_ => TaskRunner.RunInBackground(async () => await client.ConnectAsync(BrokerWorkingDir)));
                    WriteLog("Accepting clients");
                    server.In.ConsumeAsync(c => { }).IgnoreAwait();
                    var connections = Task.WhenAll(connectTasks).ShouldCompleteIn(Timeout10Sec);
                    WriteLog("Clients connected");                    
                }
            });
        }

        [Fact]
        public void CancelConnect()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = CreateClient();
                var cancellation = new CancellationTokenSource();
                var connectionTask = client.ConnectAsync(BrokerWorkingDir, cancellation.Token).AsTask();
                await Task.Delay(100, CancellationToken.None).ConfigureAwait(false);
                cancellation.Cancel();
                Should.Throw<TaskCanceledException>(connectionTask, Timeout1Sec);
            });
        }

        [Fact]
        public void SendFromClientToServer()
        {
            RunWith5SecTimeout(async () =>
            {
                var testMsg = new byte[] {1, 2, 3, 4, 5};
                IPooledBuffer receivedMsg;
                WriteLog("Starting server");
                using (var server = CreateServer())
                {
                    await server.StartAsync();
                    var serverConnectionTask = server.In.ReadAsync();
                    WriteLog("Connecting client");
                    var client = CreateClient();
                    using (var clientConnection = await client.ConnectAsync(BrokerWorkingDir))
                    {
                        WriteLog("Client connected");                        
                        await clientConnection.Out.WriteAsync(PooledBuffer.Get(testMsg));
                        using (var serverConection = await serverConnectionTask)
                        {
                            receivedMsg = await serverConection.In.ReadAsync();
                            WriteLog("Disposing server connection");
                        }
                        WriteLog("Disposing client connection");
                    }
                    WriteLog("Disposing server");
                }
                receivedMsg.ToArray().ShouldBe(testMsg);
            });
        }

        [Fact]
        public void SendFromServerToClient()
        {
            RunWith5SecTimeout(async () =>
            {
                var testMsg = new byte[] { 1, 2, 3, 4, 5 };
                IPooledBuffer receivedMsg;
                WriteLog("Starting server");
                using (var server = CreateServer())
                {
                    await server.StartAsync();
                    var serverConnectionTask = server.In.ReadAsync();
                    WriteLog("Connecting client");
                    var client = CreateClient();
                    using (var clientConnection = await client.ConnectAsync(BrokerWorkingDir))
                    {
                        WriteLog("Client connected");                        
                        using (var serverConection = await serverConnectionTask)
                        {
                            await serverConection.Out.WriteAsync(PooledBuffer.Get(testMsg));
                            receivedMsg = await clientConnection.In.ReadAsync();
                            WriteLog("Disposing connections");
                        }
                    }
                    WriteLog("Disposing server");
                }
                receivedMsg.ToArray().ShouldBe(testMsg);
            });
        }

        public static readonly IEnumerable<object[]> ConcurrentSendAndReceiveTestData = new object[][]
        {
            new object[]
            {
                new byte[][] { },
                new byte[][] { }
            },
            new object[]
            {
                new byte[][] { new byte[] { 1, 2, 3 } },
                new byte[][] { }
            },
            new object[]
            {
                new byte[][] { },
                new byte[][] { new byte[] { 1, 2, 3 } },
            },
            new object[]
            {
                new byte[][] { new byte[] { 1, 2, 3 } },
                new byte[][] { new byte[] { 1, 2, 3 } },
            },
            new object[]
            {
                new byte[][] { new byte[] { } },
                new byte[][] { },
            },
            new object[]
            {
                new byte[][] { },
                new byte[][] { new byte[] { } },
            },
            new object[]
            {
                new byte[][] { new byte[] { 1, 2, 3 }, new byte[] { }, new byte[] { 5, 4, 3, 2, 1 }},
                new byte[][] { },
            },
            new object[]
            {
                new byte[][] { new byte[] { 1, 2, 3 }, new byte[] { }, new byte[] { 5, 4, 3, 2, 1 }},
                new byte[][] { new byte[] { 1, 2, 3 }, new byte[] { }, new byte[] { 5, 4, 3, 2, 1 }},
            },
        };

        [Theory]
        [MemberData(nameof(ConcurrentSendAndReceiveTestData))]
        public void ConcurrentSendAndReceive(byte[][] serverMessages, byte[][] clientMessages)
        {
            var serverRecevied = new List<byte[]>();
            var clientReceived = new List<byte[]>();

            var serverTask = TaskRunner.RunInBackground(async () =>
            {
                var server = RegisterDisposable(CreateServer());
                await server.StartAsync().ConfigureAwaitWithTimeout(Timeout5Sec);
                using (var serverConnection = RegisterDisposable(await server.In.ReadAsync().ConfigureAwait(false)))
                {
                    var receiveTask = TaskRunner.RunInBackground(async () =>
                    {
                        while (true)
                        {
                            var msg = await serverConnection.In.TryReadAsync().ConfigureAwait(false);
                            if (msg.HasValue)
                            {
                                WriteLog($"Server received message of length {msg.Value.Count}");
                                serverRecevied.Add(msg.Value.ToArray());
                            }
                            else
                            {
                                WriteLog("Server receive completed");
                                break;
                            }
                        }
                    });

                    var sendTask = TaskRunner.RunInBackground(async () =>
                    {
                        foreach (var msg in serverMessages)
                        {
                            WriteLog($"Server sending message of length {msg.Length}");
                            await serverConnection.Out.WriteAsync(PooledBuffer.Get(msg)).ConfigureAwait(false);
                        }
                        serverConnection.Out.TryComplete();
                        WriteLog("Server send completed");
                    });

                    await Task.WhenAll(sendTask, receiveTask, serverConnection.Completion).ConfigureAwait(false);

                    WriteLog("Server completed");
                }
            });

            var clientTask = TaskRunner.RunInBackground(async () =>
            {
                var clientFactory = CreateClient();
                Log.Trace("Connecting client");
                using (var connection = RegisterDisposable(await clientFactory.ConnectAsync(BrokerWorkingDir).ConfigureAwait(false)))
                {
                    var receiveTask = TaskRunner.RunInBackground(async () =>
                    {
                        while (true)
                        {
                            var msg = await connection.In.TryReadAsync().ConfigureAwait(false);
                            if (msg.HasValue)
                            {
                                Log.Trace("Client received message of length {0}", msg.Value.Count);
                                clientReceived.Add(msg.Value.ToArray());
                            }
                            else
                            {
                                Log.Trace("Client receive completed");
                                break;
                            }
                        }
                    });

                    var sendTask = TaskRunner.RunInBackground(async () =>
                    {
                        foreach (var msg in clientMessages)
                        {
                            Log.Trace("Client sending message of length {0}", msg.Length);
                            await connection.Out.WriteAsync(PooledBuffer.Get(msg)).ConfigureAwait(false);
                        }
                        connection.Out.TryComplete();
                        Log.Trace("Client send completed");
                    });

                    await Task.WhenAll(sendTask, receiveTask, connection.Completion).ConfigureAwait(false);
                    Log.Trace("Client completed");
                }
            });

            Should.CompleteIn(Task.WhenAny(serverTask, clientTask).Unwrap(), TimeoutConstants.Timeout10Sec);
            Should.CompleteIn(Task.WhenAll(serverTask, clientTask), TimeoutConstants.Timeout10Sec);

            serverRecevied.Count.ShouldBe(clientMessages.Length);
            clientReceived.Count.ShouldBe(serverMessages.Length);
            for (var i = 0; i < clientMessages.Length; i++)
            {
                serverRecevied[i].ShouldBe(clientMessages[i]);
            }
            for (var i = 0; i < serverMessages.Length; i++)
            {
                clientReceived[i].ShouldBe(serverMessages[i]);
            }
        }
    }
}