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
namespace Plexus.Interop
{
    using Google.Protobuf;
    using Plexus.Channels;
    using Plexus.Interop.Testing;
    using Plexus.Interop.Testing.Generated;
    using Shouldly;
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Interop.Transport.Protocol;
    using Xunit;
    using Xunit.Abstractions;

    public sealed class ClientBrokerIntegrationTests : TestsSuite, IClassFixture<TestBrokerFixture>
    {
        private static readonly UnaryMethod<EchoRequest, EchoRequest> EchoUnaryMethod =
            Method.Unary<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "Unary");
        
        private static readonly ServerStreamingMethod<EchoRequest, EchoRequest> EchoServerStreamingMethod =
            Method.ServerStreaming<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "ServerStreaming");

        private static readonly ClientStreamingMethod<EchoRequest, EchoRequest> EchoClientStreamingMethod =
            Method.ClientStreaming<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "ClientStreaming");

        private static readonly DuplexStreamingMethod<EchoRequest, EchoRequest> EchoDuplexStreamingMethod =
            Method.DuplexStreaming<EchoRequest, EchoRequest>("plexus.interop.testing.EchoService", "DuplexStreaming");

        private readonly TestBrokerFixture _testBrokerFixture;

        public ClientBrokerIntegrationTests(ITestOutputHelper output, TestBrokerFixture testBrokerFixture) : base(output)
        {
            _testBrokerFixture = testBrokerFixture;
            _testBrokerFixture.OnBeforeTest();
        }

        public override void Dispose()
        {
            base.Dispose();
            _testBrokerFixture.OnAfterTest();
        }

        [Fact]
        public void ClientConnectDisconnect()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = ConnectEchoClient();
                await client.DisconnectAsync();
            });
        }

        [Fact]
        public void ConcurrentClientConnectDisconnect()
        {
            RunWith30SecTimeout(() =>
            {
                const int concurrentClientCount = 5;
                var connectTasks = Enumerable.Range(0, concurrentClientCount)
                    .Select(_ => TaskRunner.RunInBackground(() => ConnectEchoClient()));
                var clients = Task.WhenAll(connectTasks).ShouldCompleteIn(Timeout30Sec);
                var disconnectTasks = clients.Select(c => TaskRunner.RunInBackground(c.DisconnectAsync));
                Task.WhenAll(disconnectTasks).ShouldCompleteIn(Timeout30Sec);
            });
        }

        [Fact]
        public void ExceptionWhenConnectingWithUnexistingAppId()
        {
            Should.Throw<Exception>(() => ConnectClient("plexus.interop.testing.UnexistingApp"));
        }

        [Fact]
        public void BrokerStopWhenThereAreActiveConnections()
        {
            RunWith10SecTimeout(async () =>
            {
                using (var broker = _testBrokerFixture.CreateBroker())
                {
                    await broker.StartAsync();
                    var client = ConnectEchoClient(broker);
                    await broker.StopAsync();
                    client.Completion.ShouldCompleteIn(Timeout5Sec);
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
                using (var broker = _testBrokerFixture.CreateBroker())
                {
                    await broker.StartAsync().ConfigureAwait(false);
                    await broker.StopAsync().ConfigureAwait(false);
                }
            });
        }

        [Fact]
        public void ExceptionWhenTargetServiceNotProvided()
        {
            RunWith10SecTimeout(() =>
            {
                Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
                {
                    return Task.FromResult(request);
                }

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
            });
        }

        [Fact]
        public void ExceptionWhenTargetMethodThrowsException()
        {
            RunWith10SecTimeout(() =>
            {
                async Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
                {
                    WriteLog("Handling request by throwing exception");
                    await Task.Yield();
                    throw new ArgumentException();
                }

                var client = ConnectEchoClient();
                ConnectEchoServer(x => x
                    .WithProvidedService(
                        "plexus.interop.testing.EchoService",
                        s => s.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync)
                    )
                );
                WriteLog("Starting call");
                var ex = Should.Throw<Exception>(client.CallInvoker.Call(EchoUnaryMethod, CreateTestRequest()).AsTask(),
                    Timeout5Sec);
                WriteLog($"Exception received: {ex.FormatTypeAndMessage()}");
            });
        }

        [Fact]
        public void ExceptionWhenTargetMethodNotProvided()
        {
            RunWith10SecTimeout(() =>
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

                async Task HandleAsync(EchoRequest request, IWritableChannel<EchoRequest> responseStream,
                    MethodCallContext context)
                {
                    Console.WriteLine("Handling invocation");
                    receivedRequest = request;
                    await responseStream.WriteAsync(request).ConfigureAwait(false);
                    await responseStream.WriteAsync(request).ConfigureAwait(false);
                    await responseStream.WriteAsync(request).ConfigureAwait(false);
                    Console.WriteLine("Responses sent");
                }

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

                async Task HandleAsync(EchoRequest request, IWritableChannel<EchoRequest> responseStream,
                    MethodCallContext context)
                {
                    try
                    {
                        WriteLog("Server handling invocation");
                        await responseStream.WriteAsync(request).ConfigureAwait(false);
                        WriteLog("Server waiting for cancellation");
                        await context.CancellationToken.ToAwaitable();
                    }
                    catch (Exception ex)
                    {
                        serverCallCompletion.TryFail(ex);
                        throw;
                    }
                }

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
            });
        }

        [Fact]
        public void ClientStreamingCall()
        {
            RunWith10SecTimeout(async () =>
            {
                Console.WriteLine("Starting test");
                var receivedRequests = new List<EchoRequest>();

                async Task<EchoRequest> HandleAsync(IReadableChannel<EchoRequest> requestStream,
                    MethodCallContext context)
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
            });
        }

        [Fact]        
        public void DiscoveryByMethod()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = ConnectEchoClient();
                var discoveryResults = await client.DiscoveryInvoker.DiscoverAsync(EchoUnaryMethod);
                discoveryResults.Count.ShouldBe(1);
                var discoveryResult = discoveryResults.Single();
                discoveryResult.Title.ShouldBe("Sample Unary Method");
                discoveryResult.ProvidedMethod.ProvidedService.ServiceId.ShouldBe("plexus.interop.testing.EchoService");
                discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.HasValue.ShouldBeFalse();
                discoveryResult.ProvidedMethod.ProvidedService.ApplicationId.ShouldBe(
                    "plexus.interop.testing.EchoServer");
                discoveryResult.ProvidedMethod.Name.ShouldBe("Unary");
                discoveryResult.InputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                discoveryResult.OutputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                discoveryResult.Type.ShouldBe(MethodType.Unary);
            });
        }

        [Fact]
        public void DiscoveryByMethodWithNoResponse()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = ConnectEchoClient();
                var discoveryResults = await client.DiscoveryInvoker.DiscoverAsync(EchoUnaryMethod);
                discoveryResults.Count.ShouldBe(1);
                var discoveryResult = discoveryResults.Single();
                discoveryResult.Title.ShouldBe("Sample Unary Method");
                discoveryResult.ProvidedMethod.ProvidedService.ServiceId.ShouldBe("plexus.interop.testing.EchoService");
                discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.HasValue.ShouldBeFalse();
                discoveryResult.ProvidedMethod.ProvidedService.ApplicationId.ShouldBe(
                    "plexus.interop.testing.EchoServer");
                discoveryResult.ProvidedMethod.Name.ShouldBe("Unary");
                discoveryResult.InputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                discoveryResult.OutputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                discoveryResult.Type.ShouldBe(MethodType.Unary);
            });
        }

        [Fact]
        public void DiscoveryByService()
        {
            RunWith10SecTimeout(async () =>
            {
                ConnectEchoServer();
                ConnectEchoServer();
                var client = ConnectEchoClient();
                var discoveryResults =
                    await client.DiscoveryInvoker.DiscoverAsync(
                        ServiceDiscoveryQuery.Create(EchoUnaryMethod.Reference.Service));
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
            });
        }

        [Fact]
        public void OnlineDiscoveryByMethod()
        {
            RunWith10SecTimeout(async () =>
            {
                var server1 = ConnectEchoServer();
                var server2 = ConnectEchoServer();
                var client = ConnectEchoClient();
                var discoveryResults = await client.DiscoveryInvoker.DiscoverOnlineAsync(EchoUnaryMethod);
                discoveryResults.Count.ShouldBe(2);
                foreach (var discoveryResult in discoveryResults)
                {
                    discoveryResult.Title.ShouldBe("Sample Unary Method");
                    discoveryResult.ProvidedMethod.ProvidedService.ServiceId.ShouldBe(
                        "plexus.interop.testing.EchoService");
                    discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.HasValue.ShouldBeFalse();
                    discoveryResult.ProvidedMethod.ProvidedService.ApplicationId.ShouldBe(
                        "plexus.interop.testing.EchoServer");
                    discoveryResult.ProvidedMethod.ProvidedService.ServiceAlias.ShouldBe(Maybe<string>.Nothing);
                    discoveryResult.ProvidedMethod.Name.ShouldBe("Unary");
                    discoveryResult.InputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                    discoveryResult.OutputMessageId.ShouldBe("plexus.interop.testing.EchoRequest");
                    discoveryResult.Type.ShouldBe(MethodType.Unary);
                    discoveryResult.ProviderConnectionId.ShouldBeOneOf(server1.ConnectionId, server2.ConnectionId);
                }
            });
        }

        [Fact]
        public void OnlineDiscoveryByService()
        {
            RunWith10SecTimeout(async () =>
            {
                var server1 = ConnectEchoServer();
                var server2 = ConnectEchoServer();
                var client = ConnectEchoClient();
                var discoveryResults =
                    await client.DiscoveryInvoker.DiscoverOnlineAsync(
                        ServiceDiscoveryQuery.Create(EchoUnaryMethod.Reference.Service));
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
                    serverStreamingMethod.ProviderConnectionId.ShouldBeOneOf(server1.ConnectionId,
                        server2.ConnectionId);
                    serverStreamingMethod.Title.ShouldBe("Sample Server Streaming Method");
                }
            });
        }

        [Fact]
        public void DiscoveryByMethodThenInvoke()
        {
            RunWith10SecTimeout(async () =>
            {
                Task<EchoRequest> HandleAsync(EchoRequest msg, MethodCallContext context)
                {
                    return Task.FromResult(msg);
                }

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
            });
        }

        [Fact]
        public void DiscoveryByInputMessage()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = ConnectEchoClient();
                var discoveryResults = await client.DiscoveryInvoker.DiscoverAsync<EchoRequest>();
                discoveryResults.Count.ShouldBe(4);
                var unary = discoveryResults.Single(x => string.Equals(x.ProvidedMethod.Name, "Unary"));
                unary.Type.ShouldBe(MethodType.Unary);
                var serverStreaming =
                    discoveryResults.Single(x => string.Equals(x.ProvidedMethod.Name, "ServerStreaming"));
                serverStreaming.Type.ShouldBe(MethodType.ServerStreaming);
            });
        }

        [Fact]
        public void ExceptionWhenTargetAppIsNotRunningAndCannotBeStarted()
        {
            RunWith10SecTimeout(() =>
            {
                var client = ConnectEchoClient();
                Should.Throw<Exception>(async () => await client.CallInvoker.Call(EchoUnaryMethod, new EchoRequest()),
                    Timeout5Sec);
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
                var echoServerFactory = new TestClientFactory(
                    (broker, id) =>
                    {
                        var optionsBuilder = new ClientOptionsBuilder()
                            .WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir)
                            .WithDefaultConfiguration()
                            .WithProvidedService(
                                EchoService.Id,
                                x => x.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync))
                            .WithApplicationId(EchoServerClient.Id);

                        return ClientFactory.Instance.Create(optionsBuilder.Build());
                    });
                var appLauncher = RegisterDisposable(
                    new TestAppLauncher(
                        _testBrokerFixture.SharedInstance,
                        new Dictionary<string, TestClientFactory> { { EchoServerClient.Id, echoServerFactory } }
                    )
                );
                await appLauncher.StartAsync();
                var client = ConnectEchoClient();
                var request = CreateTestRequest();
                var response = await client.CallInvoker.Call(EchoUnaryMethod, request);
                response.ShouldBe(request);
                receivedRequest.ShouldBe(request);
            });
        }

        [Fact]
        public void InvocationShouldBeRoutedToAnotherInstanceEvenIfSourceAppCanHandleIt()
        {
            MethodCallContext receivedRequestContext = null;

            Task<EchoRequest> HandleAsync(EchoRequest request, MethodCallContext context)
            {
                receivedRequestContext = context;
                return Task.FromResult(request);
            }

            RunWith10SecTimeout(async () =>
            {
                var echoServerFactory = new TestClientFactory(
                    (broker, id) =>
                    {
                        var optionsBuilder = new ClientOptionsBuilder()
                            .WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir)
                            .WithDefaultConfiguration()
                            .WithProvidedService(
                                EchoService.Id,
                                x => x.WithUnaryMethod<EchoRequest, EchoRequest>("Unary", HandleAsync))
                            .WithApplicationId(EchoServerClient.Id);

                        return ClientFactory.Instance.Create(optionsBuilder.Build());
                    });
                var appLauncher = RegisterDisposable(
                    new TestAppLauncher(
                        _testBrokerFixture.SharedInstance,
                        new Dictionary<string, TestClientFactory> { { EchoServerClient.Id, echoServerFactory } }
                    )
                );
                await appLauncher.StartAsync();
                var server = ConnectEchoServer();
                var request = CreateTestRequest();
                var response = await server.CallInvoker.Call(EchoUnaryMethod, request);
                response.ShouldBe(request);
                receivedRequestContext.ShouldNotBeNull();
                receivedRequestContext.ConsumerConnectionId.ShouldBe(server.ConnectionId);
            });
        }

        [Fact]
        public void InvocationShouldAlwaysTriggerLaunchWhenMethodLaunchModeSetToAlways()
        {
            Task<GreetingResponse> HandleAsync(GreetingRequest greetingRequest, MethodCallContext context)
            {
                return Task.FromResult(new GreetingResponse { Greeting = greetingRequest.Name });
            }

            RunWith10SecTimeout(async () =>
            {
                var serverCreatedCount = 0;
                var echoServerFactory = new TestClientFactory(
                    (broker, id) =>
                    {
                        var optionsBuilder = new ClientOptionsBuilder()
                            .WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir)
                            .WithAppInstanceId(id)
                            .WithApplicationId(EchoServerClient.Id)
                            .WithDefaultConfiguration()
                            .WithProvidedService(
                                GreetingService.Id,
                                "AlwaysLaunchGreetingService",
                                x => x.WithUnaryMethod<GreetingRequest, GreetingResponse>("Hello", HandleAsync));

                        serverCreatedCount++;

                        return Task.FromResult(ClientFactory.Instance.Create(optionsBuilder.Build()));
                    });

                var appLauncher = RegisterDisposable(
                    new TestAppLauncher(
                        _testBrokerFixture.SharedInstance,
                        new Dictionary<string, TestClientFactory>
                        {
                            {EchoServerClient.Id, echoServerFactory}
                        }
                    )
                );
                await appLauncher.StartAsync();
                ConnectEchoServer();
                var client = new EchoClient(s => s.WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir));
                client.ConnectAsync().ShouldCompleteIn(Timeout5Sec);
                var callDescriptor = new MethodCallDescriptor(
                    ProvidedMethodReference.Create(GreetingService.Id, "AlwaysLaunchGreetingService", "Hello", EchoServerClient.Id));
                await client.CallInvoker.CallUnary(callDescriptor, new GreetingRequest { Name = "Test" });
                await client.CallInvoker.CallUnary(callDescriptor, new GreetingRequest { Name = "Test" });
                serverCreatedCount.ShouldBe(2);
            });
        }

        [Fact]
        public void InvocationShouldNotTriggerSubsequentLaunchWhenMethodLaunchModeSetToDefault()
        {
            var serverInvokedCount = 0;

            Task<GreetingResponse> HandleAsync(GreetingRequest greetingRequest, MethodCallContext context)
            {
                Interlocked.Increment(ref serverInvokedCount);
                return Task.FromResult(new GreetingResponse { Greeting = greetingRequest.Name });
            }

            RunWith10SecTimeout(async () =>
            {
                var serverCreatedCount = 0;
                var echoServerFactory = new TestClientFactory(
                    (broker, id) =>
                    {
                        WriteLog("Launching server on demand");

                        var optionsBuilder = new ClientOptionsBuilder()
                            .WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir)
                            .WithAppInstanceId(id)
                            .WithApplicationId(EchoServerClient.Id)
                            .WithDefaultConfiguration()
                            .WithProvidedService(
                                GreetingService.Id,
                                x => x.WithUnaryMethod<GreetingRequest, GreetingResponse>("Hello", HandleAsync));

                        serverCreatedCount++;

                        return ClientFactory.Instance.Create(optionsBuilder.Build());
                    });

                var appLauncher = RegisterDisposable(
                    new TestAppLauncher(
                        _testBrokerFixture.SharedInstance,
                        new Dictionary<string, TestClientFactory>
                        {
                            {EchoServerClient.Id, echoServerFactory}
                        }
                    )
                );
                await appLauncher.StartAsync();
                var client = new EchoClient(s => s.WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir));
                client.ConnectAsync().ShouldCompleteIn(Timeout5Sec);
                var callDescriptor = new MethodCallDescriptor(
                    ProvidedMethodReference.Create(GreetingService.Id, "Hello", EchoServerClient.Id));
                var call1 = client.CallInvoker.CallUnary(callDescriptor, new GreetingRequest { Name = "Test" });
                var call2 = client.CallInvoker.CallUnary(callDescriptor, new GreetingRequest { Name = "Test" });
                await Task.WhenAny(call1.AsTask(), call2.AsTask());
                WriteLog("Call 1 completed");
                await Task.WhenAll(call1.AsTask(), call2.AsTask());
                WriteLog("Call 2 completed");
                serverCreatedCount.ShouldBe(1);
                serverInvokedCount.ShouldBe(2);
            });
        }

        [Fact]
        public void InvocationShouldFailIfThereIsNoOnlineInstanceAndMethodLaunchModeSetToNever()
        {
            Task<GreetingResponse> HandleAsync(GreetingRequest greetingRequest, MethodCallContext context)
            {
                return Task.FromResult(new GreetingResponse { Greeting = greetingRequest.Name });
            }

            RunWith10SecTimeout(async () =>
            {
                var serverCreatedCount = 0;
                var echoServerFactory = new TestClientFactory(
                    (broker, id) =>
                    {
                        var optionsBuilder = new ClientOptionsBuilder()
                            .WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir)
                            .WithAppInstanceId(id)
                            .WithApplicationId(EchoServerClient.Id)
                            .WithDefaultConfiguration()
                            .WithProvidedService(
                                GreetingService.Id,
                                "NeverLaunchGreetingService",
                                x => x.WithUnaryMethod<GreetingRequest, GreetingResponse>("Hello", HandleAsync));

                        serverCreatedCount++;

                        return ClientFactory.Instance.Create(optionsBuilder.Build());
                    });

                var appLauncher = RegisterDisposable(
                    new TestAppLauncher(
                        _testBrokerFixture.SharedInstance,
                        new Dictionary<string, TestClientFactory>
                        {
                            {EchoServerClient.Id, echoServerFactory}
                        }
                    )
                );
                await appLauncher.StartAsync();
                var client = new EchoClient(s => s.WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir));
                await client.ConnectAsync();
                var callDescriptor = new MethodCallDescriptor(
                    ProvidedMethodReference.Create(GreetingService.Id, "NeverLaunchGreetingService", "Hello", EchoServerClient.Id));
                client.CallInvoker
                    .CallUnary(callDescriptor, new GreetingRequest {Name = "Test"})
                    .AsTask()
                    .ShouldThrow<RemoteErrorException>();
                serverCreatedCount.ShouldBe(0);
            });
        }

        [Theory]
        [InlineData(0, 0)]
        [InlineData(1, 0)]
        [InlineData(1, 1)]
        [InlineData(1, 10)]
        [InlineData(10, 0)]
        [InlineData(10, 1)]        
        [InlineData(10, 10)]
        [InlineData(100, 10)]
        public void DuplexStreamingStress(int requestsCount, int responsesPerRequest)
        {
            async Task HandleAsync(
                IReadableChannel<EchoRequest> requestStream,
                IWritableChannel<EchoRequest> responseStream,
                MethodCallContext context)
            {                
                WriteLog("Provider: Started request");
                var x = 0;
                do
                {
                    while (requestStream.TryRead(out var item))
                    {
                        var stopwatch = new Stopwatch();
                        Log.Info($"Provider: request {x} received");                        
                        for (var i = 0; i < responsesPerRequest; i++)
                        {
                            var y = x * responsesPerRequest + i;
                            Log.Info($"Provider: sending response {y}");
                            stopwatch.Restart();
                            await responseStream.WriteAsync(item).ConfigureAwait(false);
                            stopwatch.Stop();
                            Log.Info($"Provider: response {y} sent in {stopwatch.ElapsedMilliseconds}ms");
                        }
                        x++;
                    }
                } while (await requestStream.WaitReadAvailableAsync().ConfigureAwait(false));
                WriteLog("Provider: completed request");
            }

            RunWith30SecTimeout(async () =>
            {
                ConnectEchoServer(x => x
                    .WithProvidedService(
                        "plexus.interop.testing.EchoService",
                        s => s.WithDuplexStreamingMethod<EchoRequest, EchoRequest>("DuplexStreaming", HandleAsync)
                    )
                );
                var client = ConnectEchoClient();
                var call = client.CallInvoker.Call(EchoDuplexStreamingMethod);
                var request = CreateTestRequest();
                var receivedResponsesCount = 0;
                var sendWorker = TaskRunner.RunInBackground(async () =>
                {
                    var stopwatch = new Stopwatch();
                    for (var i = 0; i < requestsCount; i++)
                    {
                        stopwatch.Restart();
                        await call.RequestStream.WriteAsync(request).ConfigureAwait(false);
                        stopwatch.Stop();
                        Log.Info($"Consumer: request {i} sent in {stopwatch.ElapsedMilliseconds}ms");
                    }

                    WriteLog("Consumer: completing request stream");
                    await call.RequestStream.CompleteAsync().ConfigureAwait(false);
                });
                var receiveWorker = TaskRunner.RunInBackground(async () =>
                {
                    do
                    {
                        while (call.ResponseStream.TryRead(out _))
                        {
                            Log.Info($"Consumer: response {receivedResponsesCount} received");
                            receivedResponsesCount++;
                        }
                    } while (await call.ResponseStream.WaitReadAvailableAsync().ConfigureAwait(false));

                    WriteLog("Consumer: response stream completed");
                });
                await Task.WhenAll(sendWorker, receiveWorker).ConfigureAwait(false);
                await call.Completion.ConfigureAwait(false);
                receivedResponsesCount.ShouldBe(requestsCount * responsesPerRequest);
            });
        }

        private IClient ConnectEchoClient(ITestBroker testBroker = null)
        {
            testBroker = testBroker ?? _testBrokerFixture.SharedInstance;
            var clientOptions = new ClientOptionsBuilder()
                .WithBrokerWorkingDir(testBroker.WorkingDir)
                .WithDefaultConfiguration()
                .WithApplicationId("plexus.interop.testing.EchoClient")
                .Build();
            var client = RegisterDisposable(ClientFactory.Instance.Create(clientOptions));
            client.ConnectAsync().ShouldCompleteIn(Timeout10Sec);
            return client;
        }

        private IClient ConnectClient(string appId, ITestBroker testBroker = null)
        {
            testBroker = testBroker ?? _testBrokerFixture.SharedInstance;
            var clientOptions = new ClientOptionsBuilder()
                .WithBrokerWorkingDir(testBroker.WorkingDir)
                .WithDefaultConfiguration()
                .WithApplicationId(appId)
                .Build();
            var client = RegisterDisposable(ClientFactory.Instance.Create(clientOptions));
            client.ConnectAsync().ShouldCompleteIn(Timeout10Sec);
            return client;
        }

        private IClient ConnectEchoServer(Action<ClientOptionsBuilder> setup = null, ITestBroker testBroker = null)
        {
            testBroker = testBroker ?? _testBrokerFixture.SharedInstance;
            var clientOptionsBuilder = new ClientOptionsBuilder()
                .WithBrokerWorkingDir(testBroker.WorkingDir)
                .WithDefaultConfiguration()
                .WithApplicationId("plexus.interop.testing.EchoServer");
            setup?.Invoke(clientOptionsBuilder);
            var clientOptions = clientOptionsBuilder.Build();
            var client = RegisterDisposable(ClientFactory.Instance.Create(clientOptions));
            client.ConnectAsync().ShouldCompleteIn(Timeout10Sec);
            return client;
        }
    }
}

