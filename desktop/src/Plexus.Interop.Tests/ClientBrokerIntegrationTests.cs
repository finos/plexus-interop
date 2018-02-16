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
namespace Plexus.Interop
{
    using Google.Protobuf;
    using Plexus.Channels;
    using Plexus.Interop.Testing;
    using Plexus.Interop.Testing.Generated;
    using Shouldly;
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Xunit;
    using Xunit.Abstractions;

    public sealed class ClientBrokerIntegrationTests : TestsSuite
    {
        private readonly ConcurrentBag<TestBroker> _startedTestBrokers = new ConcurrentBag<TestBroker>();

        private static readonly UnaryMethod<EchoRequest, EchoRequest> EchoUnaryMethod =
            Method.Unary<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "Unary");
        
        private static readonly ServerStreamingMethod<EchoRequest, EchoRequest> EchoServerStreamingMethod =
            Method.ServerStreaming<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "ServerStreaming");

        private static readonly ClientStreamingMethod<EchoRequest, EchoRequest> EchoClientStreamingMethod =
            Method.ClientStreaming<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "ClientStreaming");

        private static readonly DuplexStreamingMethod<EchoRequest, EchoRequest> EchoDuplexStreamingMethod =
            Method.DuplexStreaming<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "DuplexStreaming");

        public ClientBrokerIntegrationTests(ITestOutputHelper output) : base(output)
        {
        }

        private async Task<TestBroker> StartTestBrokerAsync()
        {            
            var broker = RegisterDisposable(new TestBroker());
            _startedTestBrokers.Add(broker);
            await broker.StartAsync();
            broker.Completion.ContinueWithOnErrorSynchronously(t =>
            {
                Log.Error(t.Exception.ExtractInner(), "Test broker exited with exception");
            }).IgnoreAwait(Log);
            return broker;
        }

        public override void Dispose()
        {
            base.Dispose();
            foreach (var testBroker in _startedTestBrokers)
            {
                testBroker.Completion.ShouldCompleteIn(Timeout1Sec);
            }
        }

        [Fact]
        public void ClientConnectDisconnect()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    await client.DisconnectAsync();
                }
            });
        }

        [Fact]
        public void ConcurrentClientConnectDisconnect()
        {
            RunWith30SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    const int concurrentClientCount = 15;
                    var connectTasks = Enumerable.Range(0, concurrentClientCount)
                        .Select(_ => TaskRunner.RunInBackground(() => ConnectEchoClient()));
                    var clients = Task.WhenAll(connectTasks).ShouldCompleteIn(Timeout10Sec);
                    var disconnectTasks = clients.Select(c => TaskRunner.RunInBackground(c.DisconnectAsync));
                    Task.WhenAll(disconnectTasks).ShouldCompleteIn(Timeout10Sec);
                }
            });
        }

        [Fact]
        public void ExceptionWhenConnectingWithUnexistingAppId()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    Should.Throw<Exception>(() => ConnectClient("plexus.interop.testing.UnexistingApp"));
                }
            });
        }

        [Fact]
        public void BrokerStopWhenThereAreActiveConnections()
        {
            RunWith10SecTimeout(async () =>
            {
                using (var broker = await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    await broker.StopAsync();
                    client.Completion.ShouldCompleteIn(Timeout1Sec);
                    client.CallInvoker.Call(EchoUnaryMethod, new EchoRequest())
                        .AsTask()
                        .ShouldThrow<TaskCanceledException>(Timeout1Sec);
                }
            });
        }

        [Fact]
        public void UnaryCall()
        {
            RunWith10SecTimeout(async () =>
            {
                Console.WriteLine("Starting test");
                EchoRequest receivedRequest = null;
                MethodCallContext receivedCallContext = null;

                Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
                {
                    receivedRequest = request;
                    receivedCallContext = context;
                    return Task.FromResult(request);
                }

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync)
                        )
                    );
                    var sentRequest = CreateTestRequest();
                    Console.WriteLine("Starting call");
                    var response = await client.CallInvoker.Call(EchoUnaryMethod, sentRequest);
                    Console.WriteLine("Response received");
                    receivedRequest.ShouldBe(sentRequest);
                    response.ShouldBe(sentRequest);
                    receivedCallContext.ShouldNotBeNull();
                    receivedCallContext.ConsumerApplicationId.ShouldBe("plexus.interop.testing.EchoClient");
                    receivedCallContext.ConsumerConnectionId.ShouldBe(client.ConnectionId);
                }
            });
        }

        private static EchoRequest CreateTestRequest()
        {
            var sentRequest = new EchoRequest
            {
                Int64Field = long.MaxValue - 100,
                EnumField = EchoRequest.Types.SubEnum.ValueTwo,
                Uint32Field = uint.MinValue
            };
            sentRequest.RepeatedDoubleField.Add(new[] {0, -0.5, 123.1});
            sentRequest.RepeatedSubMessageField.Add(
                new EchoRequest.Types.SubMessage
                {
                    BytesField = ByteString.CopyFrom(1, 2, 3),
                    StringField = "abc"
                });
            return sentRequest;
        }

        [Fact]
        public void BrokerStartStop()
        {
            RunWith10SecTimeout(async () =>
            {
                var broker = RegisterDisposable(new TestBroker());
                await broker.StartAsync().ConfigureAwait(false);
                await broker.StopAsync().ConfigureAwait(false);
            });
        }

        [Fact]
        public void ExceptionWhenTargetServiceDoesNotExist()
        {
            RunWith10SecTimeout(async () =>
            {
                Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
                {
                    return Task.FromResult(request);
                }

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.UnexistingService",
                            s => s.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync)
                        )
                    );
                    Console.WriteLine("Starting call");
                    Should.Throw<Exception>(() => client.CallInvoker.Call(EchoUnaryMethod, new EchoRequest()).AsTask());
                    Console.WriteLine("Response received");
                }
            });
        }

        [Fact]
        public void ExceptionWhenTargetMethodThrowsException()
        {
            RunWith10SecTimeout(async () =>
            {
                async Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
                {
                    await Task.Yield();
                    throw new ArgumentException();
                }

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync)
                        )
                    );
                    Console.WriteLine("Starting call");
                    var ex = Should.Throw<Exception>(() => client.CallInvoker.Call(EchoUnaryMethod, new EchoRequest()).AsTask());
                    Console.WriteLine("Exception received: {0}", ex.FormatToString());
                }
            });
        }

        [Fact]
        public void ExceptionWhenTargetMethodDoesNotExist()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s
                        )
                    );
                    Console.WriteLine("Starting call");
                    Should.Throw<Exception>(() => client.CallInvoker.Call(EchoUnaryMethod, new EchoRequest()).AsTask());
                    Console.WriteLine("Response received");
                }
            });
        }
        
        [Fact]
        public void ServerStreamingCall()
        {
            RunWith10SecTimeout(async () =>
            {
                Console.WriteLine("Starting test");
                EchoRequest receivedRequest = null;
                var responses = new List<EchoRequest>();
                var sentRequest = CreateTestRequest();

                async Task HandleAsync(EchoRequest request, IWritableChannel<EchoRequest> responseStream, MethodCallContext context)
                {
                    Console.WriteLine("Handling invocation");
                    receivedRequest = request;
                    await responseStream.WriteAsync(request).ConfigureAwait(false);                    
                    await responseStream.WriteAsync(request).ConfigureAwait(false);
                    await responseStream.WriteAsync(request).ConfigureAwait(false);
                    Console.WriteLine("Responses sent");
                }

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s.WithServerStreamingMethod<EchoRequest, EchoRequest>("ServerStreaming", HandleAsync)
                        )
                    );                    
                    Console.WriteLine("Starting call");
                    var call = client.CallInvoker.Call(EchoServerStreamingMethod, sentRequest);                    
                    while (await call.ResponseStream.WaitReadAvailableAsync())
                    {
                        while (call.ResponseStream.TryRead(out var item))
                        {
                            responses.Add(item);
                        }
                    }
                    Console.WriteLine("Responses received");
                }
                receivedRequest.ShouldBe(sentRequest);
                responses.ShouldAllBe(r => r.Equals(sentRequest));
            });
        }

        [Fact]
        public void ServerStreamingCancellation()
        {
            RunWith10SecTimeout(async () =>
            {
                WriteLog("Starting test");
                var sentRequest = CreateTestRequest();
                var serverCallCompletion = new Promise();

                async Task HandleAsync(EchoRequest request, IWritableChannel<EchoRequest> responseStream, MethodCallContext context)
                {
                    try
                    {
                        WriteLog("Server handling invocation");
                        await responseStream.WriteAsync(request).ConfigureAwait(false);
                        WriteLog("Server waiting for cancellation");
                        await context.CancellationToken.AsTask();
                    }
                    catch (Exception ex)
                    {
                        serverCallCompletion.TryFail(ex);
                        throw;
                    }
                }

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s.WithServerStreamingMethod<EchoRequest, EchoRequest>("ServerStreaming", HandleAsync)
                        )
                    );
                    WriteLog("Starting call");
                    var call = client.CallInvoker.Call(EchoServerStreamingMethod, sentRequest);
                    await call.ResponseStream.ReadAsync();
                    WriteLog("Cancelling call");
                    call.CancelAsync().ShouldCompleteIn(Timeout5Sec);
                    WriteLog("Client call canceled");
                    serverCallCompletion.Task.ShouldThrow<OperationCanceledException>(Timeout5Sec);
                    WriteLog("Server call canceled");
                }
            });
        }

        [Fact]
        public void ClientStreamingCall()
        {
            RunWith10SecTimeout(async () =>
            {
                Console.WriteLine("Starting test");
                var receivedRequests = new List<EchoRequest>();

                async Task<EchoRequest> HandleAsync(IReadableChannel<EchoRequest> requestStream, MethodCallContext context)
                {
                    while (await requestStream.WaitReadAvailableAsync().ConfigureAwait(false))
                    {
                        while (requestStream.TryRead(out var item))
                        {
                            receivedRequests.Add(item);
                        }
                    }
                    Console.WriteLine("Received {0} requests", receivedRequests.Count);
                    return receivedRequests.Last();
                }

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s.WithClientStreamingMethod<EchoRequest, EchoRequest>("ClientStreaming", HandleAsync)
                        )
                    );
                    var sentRequest = CreateTestRequest();
                    Console.WriteLine("Starting call");
                    var call = client.CallInvoker.Call(EchoClientStreamingMethod);
                    for (var i = 0; i < 3; i++)
                    {
                        await call.RequestStream.WriteAsync(sentRequest).ConfigureAwait(false);
                    }
                    await call.RequestStream.CompleteAsync();
                    Console.WriteLine("Requests sent");
                    var response = await call.ResponseAsync;
                    Console.WriteLine("Response received");

                    await call.Completion;

                    Console.WriteLine("Call completed");

                    receivedRequests.ShouldAllBe(r => r.Equals(sentRequest));
                    response.ShouldBe(sentRequest);
                }
            });
        }

        [Fact]
        public void DuplexStreamingCall()
        {
            RunWith10SecTimeout(async () =>
            {
                Console.WriteLine("Starting test");

                async Task HandleAsync(
                    IReadableChannel<EchoRequest> requestStream, 
                    IWritableChannel<EchoRequest> responseStream, 
                    MethodCallContext context)
                {
                    while (await requestStream.WaitReadAvailableAsync())
                    {
                        while (requestStream.TryRead(out var item))
                        {
                            await responseStream.WriteAsync(item);
                        }
                    }
                }

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s.WithDuplexStreamingMethod<EchoRequest, EchoRequest>("DuplexStreaming", HandleAsync)
                        )
                    );
                    var sentRequest = CreateTestRequest();
                    Console.WriteLine("Starting call");
                    var responses = new List<EchoRequest>();
                    var call = client.CallInvoker.Call(EchoDuplexStreamingMethod);
                    for (var i = 0; i < 3; i++)
                    {
                        await call.RequestStream.WriteAsync(sentRequest);
                        var response = await call.ResponseStream.ReadAsync();
                        responses.Add(response);
                    }
                    await call.RequestStream.CompleteAsync();
                    Console.WriteLine("Requests sent");

                    while (await call.ResponseStream.WaitReadAvailableAsync())
                    {
                        while (call.ResponseStream.TryRead(out var item))
                        {
                            responses.Add(item);
                        }
                    }
                    Console.WriteLine("Responses received");

                    await call.Completion;

                    Console.WriteLine("Call completed");

                    responses.ShouldAllBe(x => x.Equals(sentRequest));
                }
            });
        }

        [Fact]        
        public void DiscoveryByMethod()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    var discoveryResults = await client.DiscoveryInvoker.DiscoverAsync(EchoUnaryMethod);
                    discoveryResults.Count.ShouldBe(1);
                    var discoveryResult = discoveryResults.Single();
                    discoveryResult.Title.ShouldBe("Sample Unary Method");
                    discoveryResult.ProvidedMethod.ProvidedService.ServiceId.ShouldBe("plexus.interop.testing.EchoService");
                    discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.HasValue.ShouldBeFalse();
                    discoveryResult.ProvidedMethod.ProvidedService.ApplicationId.ShouldBe("plexus.interop.testing.EchoServer");
                    discoveryResult.ProvidedMethod.Name.ShouldBe("Unary");
                    discoveryResult.InputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                    discoveryResult.OutputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");                    
                    discoveryResult.Type.ShouldBe(MethodType.Unary);
                }
            });
        }

        [Fact]
        public void DiscoveryByMethodWithNoResponse()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    var discoveryResults = await client.DiscoveryInvoker.DiscoverAsync(EchoUnaryMethod);
                    discoveryResults.Count.ShouldBe(1);
                    var discoveryResult = discoveryResults.Single();
                    discoveryResult.Title.ShouldBe("Sample Unary Method");
                    discoveryResult.ProvidedMethod.ProvidedService.ServiceId.ShouldBe("plexus.interop.testing.EchoService");
                    discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.HasValue.ShouldBeFalse();
                    discoveryResult.ProvidedMethod.ProvidedService.ApplicationId.ShouldBe("plexus.interop.testing.EchoServer");
                    discoveryResult.ProvidedMethod.Name.ShouldBe("Unary");
                    discoveryResult.InputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                    discoveryResult.OutputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                    discoveryResult.Type.ShouldBe(MethodType.Unary);
                }
            });
        }

        [Fact]
        public void DiscoveryByService()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    ConnectEchoServer();
                    ConnectEchoServer();
                    var client = ConnectEchoClient();
                    var discoveryResults = await client.DiscoveryInvoker.DiscoverAsync(ServiceDiscoveryQuery.Create(EchoUnaryMethod.Reference.Service));
                    discoveryResults.Count.ShouldBe(1);
                    foreach (var discoveryResult in discoveryResults)
                    {
                        discoveryResult.Title.ShouldBe("Sample Echo Service");
                        discoveryResult.ProvidedService.ApplicationId.ShouldBe("plexus.interop.testing.EchoServer");
                        discoveryResult.ProvidedService.ConnectionId.HasValue.ShouldBeFalse();
                        discoveryResult.Methods.Count.ShouldBe(4);
                        var serverStreamingMethod = discoveryResult.Methods.FirstOrDefault(x =>
                            string.Equals(x.ProvidedMethod.Name, "DuplexStreaming"));
                        serverStreamingMethod.ShouldNotBeNull();
                        serverStreamingMethod.Title.ShouldBe("Sample Duplex Streaming Method");
                        serverStreamingMethod.ProvidedMethod.ProvidedService.ConnectionId.HasValue.ShouldBeFalse();
                    }
                }
            });
        }

        [Fact]
        public void OnlineDiscoveryByMethod()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var server1 = ConnectEchoServer();
                    var server2 = ConnectEchoServer();
                    var client = ConnectEchoClient();
                    var discoveryResults = await client.DiscoveryInvoker.DiscoverOnlineAsync(EchoUnaryMethod);
                    discoveryResults.Count.ShouldBe(2);
                    foreach (var discoveryResult in discoveryResults)
                    {
                        discoveryResult.Title.ShouldBe("Sample Unary Method");
                        discoveryResult.ProvidedMethod.ProvidedService.ServiceId.ShouldBe("plexus.interop.testing.EchoService");
                        discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.HasValue.ShouldBeFalse();
                        discoveryResult.ProvidedMethod.ProvidedService.ApplicationId.ShouldBe("plexus.interop.testing.EchoServer");
                        discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.ShouldBe(Maybe<string>.Nothing);
                        discoveryResult.ProvidedMethod.Name.ShouldBe("Unary");
                        discoveryResult.InputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                        discoveryResult.OutputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                        discoveryResult.Type.ShouldBe(MethodType.Unary);
                        discoveryResult.ProviderConnectionId.ShouldBeOneOf(server1.ConnectionId, server2.ConnectionId);
                    }
                }
            });
        }

        [Fact]
        public void OnlineDiscoveryByService()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var server1 = ConnectEchoServer();
                    var server2 = ConnectEchoServer();
                    var client = ConnectEchoClient();
                    var discoveryResults = await client.DiscoveryInvoker.DiscoverOnlineAsync(ServiceDiscoveryQuery.Create(EchoUnaryMethod.Reference.Service));
                    discoveryResults.Count.ShouldBe(2);
                    foreach (var discoveryResult in discoveryResults)
                    {
                        discoveryResult.Title.ShouldBe("Sample Echo Service");                        
                        discoveryResult.ProvidedService.ApplicationId.ShouldBe("plexus.interop.testing.EchoServer");
                        discoveryResult.ProviderConnectionId.ShouldBeOneOf(server1.ConnectionId, server2.ConnectionId);
                        discoveryResult.Methods.Count.ShouldBe(4);
                        var serverStreamingMethod = discoveryResult.Methods.FirstOrDefault(x =>
                            string.Equals(x.ProvidedMethod.Name, "ServerStreaming"));
                        serverStreamingMethod.ShouldNotBeNull();
                        serverStreamingMethod.ProviderConnectionId.ShouldBeOneOf(server1.ConnectionId, server2.ConnectionId);
                        serverStreamingMethod.Title.ShouldBe("Sample Server Streaming Method");
                    }
                }
            });
        }

        [Fact]
        public void DiscoveryByMethodThenInvoke()
        {
            RunWith10SecTimeout(async () =>
            {
                Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
                {
                    return Task.FromResult(request);
                }                    

                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    ConnectEchoServer(x => x
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            s => s.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync)
                        )
                    );
                    var discoveryResult = (await client.DiscoveryInvoker.DiscoverAsync(EchoUnaryMethod)).Single();
                    var request = CreateTestRequest();
                    var response = await client.CallInvoker.Call(discoveryResult, request).ConfigureAwait(false);
                    response.ShouldBe(request);
                }                
            });
        }

        [Fact]
        public void DiscoveryByInputMessage()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    var discoveryResults = await client.DiscoveryInvoker.DiscoverAsync<EchoRequest>();
                    discoveryResults.Count.ShouldBe(4);
                    var unary = discoveryResults.Single(x => string.Equals(x.ProvidedMethod.Name, "Unary"));
                    unary.Type.ShouldBe(MethodType.Unary);
                    var serverStreaming = discoveryResults.Single(x => string.Equals(x.ProvidedMethod.Name, "ServerStreaming"));
                    serverStreaming.Type.ShouldBe(MethodType.ServerStreaming);
                }
            });
        }

        [Fact]
        public void ExceptionWhenTargetAppIsNotRunningAndCannotBeStarted()
        {
            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var client = ConnectEchoClient();
                    Should.Throw<Exception>(async () => await client.CallInvoker.Call(EchoUnaryMethod, new EchoRequest()), Timeout5Sec);
                }
            });
        }

        [Fact]
        public void AppLauncherStartAppWhenRequired()
        {
            EchoRequest receivedRequest = null;

            Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
            {
                receivedRequest = request;
                return Task.FromResult(request);
            }

            RunWith10SecTimeout(async () =>
            {
                using (await StartTestBrokerAsync())
                {
                    var serverOptionsBuilder = new ClientOptionsBuilder()
                        .WithDefaultConfiguration("TestBroker")
                        .WithProvidedService(
                            "plexus.interop.testing.EchoService",
                            x => x.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync))
                        .WithApplicationId("plexus.interop.testing.EchoServer");
                    var appLauncher = RegisterDisposable(new TestAppLauncher(new [] { serverOptionsBuilder }));
                    await appLauncher.StartAsync();
                    var client = ConnectEchoClient();
                    var request = CreateTestRequest();
                    var response = await client.CallInvoker.Call(EchoUnaryMethod, request);
                    response.ShouldBe(request);
                    receivedRequest.ShouldBe(request);
                }
            });
        }

        private IClient ConnectEchoClient()
        {
            var clientOptions = new ClientOptionsBuilder()
                .WithDefaultConfiguration("TestBroker")
                .WithApplicationId("plexus.interop.testing.EchoClient")
                .Build();
            var client = RegisterDisposable(ClientFactory.Instance.Create(clientOptions));
            client.ConnectAsync().ShouldCompleteIn(Timeout5Sec);
            return client;
        }

        private IClient ConnectClient(string appId)
        {
            var clientOptions = new ClientOptionsBuilder()
                .WithDefaultConfiguration("TestBroker")
                .WithApplicationId(appId)
                .Build();
            var client = RegisterDisposable(ClientFactory.Instance.Create(clientOptions));
            client.ConnectAsync().ShouldCompleteIn(Timeout5Sec);
            return client;
        }

        private IClient ConnectEchoServer(Action<ClientOptionsBuilder> setup = null)
        {
            var clientOptionsBuilder = new ClientOptionsBuilder()
                .WithDefaultConfiguration("TestBroker")
                .WithApplicationId("plexus.interop.testing.EchoServer");
            setup?.Invoke(clientOptionsBuilder);
            var clientOptions = clientOptionsBuilder.Build();
            var client = RegisterDisposable(ClientFactory.Instance.Create(clientOptions));
            client.ConnectAsync().ShouldCompleteIn(Timeout5Sec);
            return client;
        }
    }
}
