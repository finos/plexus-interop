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
﻿namespace Plexus.Interop.Transport.Transmission
{
    using Plexus.Channels;
    using Plexus.Pools;
    using Shouldly;
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;
    using Xunit;

    public abstract class TransmissionTestsSuite : TestsSuite
    {
        protected abstract ITransmissionServer CreateServer(CancellationToken cancellationToken = default);
        protected abstract ITransmissionClient CreateClient(CancellationToken cancellationToken = default);

        public static readonly IEnumerable<object[]> SendAndReceiveTestData = new object[][]
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
        [MemberData(nameof(SendAndReceiveTestData))]
        public void SendAndReceive(byte[][] serverMessages, byte[][] clientMessages)
        {
            var serverRecevied = new List<byte[]>();
            var clientReceived = new List<byte[]>();

            var serverTask = TaskRunner.RunInBackground(async () =>
            {
                var server = RegisterDisposable(CreateServer());
                await server.StartAsync().ConfigureAwaitWithTimeout(Timeout5Sec);
                using (var serverConnection = RegisterDisposable(await server.AcceptAsync().ConfigureAwait(false)))
                {
                    var receiveTask = TaskRunner.RunInBackground(async () =>
                    {
                        while (true)
                        {
                            var msg = await serverConnection.In.TryReadAsync().ConfigureAwait(false);
                            if (msg.HasValue)
                            {
                                Log.Trace("Server received message of length {0}", msg.Value.Count);
                                serverRecevied.Add(msg.Value.ToArray());
                            }
                            else
                            {
                                Log.Trace("Server receive completed");
                                break;
                            }
                        }
                    });

                    var sendTask = TaskRunner.RunInBackground(async () =>
                    {
                        foreach (var msg in serverMessages)
                        {
                            Log.Trace("Server sending message of length {0}", msg.Length);
                            await serverConnection.Out.WriteAsync(PooledBuffer.Get(msg)).ConfigureAwait(false);
                        }
                        serverConnection.Out.TryComplete();
                        Log.Trace("Server send completed");
                    });

                    await Task.WhenAll(sendTask, receiveTask, serverConnection.Completion).ConfigureAwait(false);

                    Log.Trace("Server completed");
                }
            });

            var clientTask = TaskRunner.RunInBackground(async () =>
            {
                var clientFactory = CreateClient();
                Log.Trace("Connecting client");
                using (var client = RegisterDisposable(await clientFactory.ConnectAsync().ConfigureAwait(false)))
                {
                    var receiveTask = TaskRunner.RunInBackground(async () =>
                    {
                        while (true)
                        {
                            var msg = await client.In.TryReadAsync().ConfigureAwait(false);
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
                            await client.Out.WriteAsync(PooledBuffer.Get(msg)).ConfigureAwait(false);
                        }
                        client.Out.TryComplete();
                        Log.Trace("Client send completed");
                    });

                    await Task.WhenAll(sendTask, receiveTask, client.Completion).ConfigureAwait(false);
                    Log.Trace("Client completed");
                }
            });

            Should.CompleteIn(Task.WhenAny(serverTask, clientTask).Unwrap(), TimeSpan.FromSeconds(10));
            Should.CompleteIn(Task.WhenAll(serverTask, clientTask), TimeSpan.FromSeconds(10));

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