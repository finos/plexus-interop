namespace Plexus.Interop
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Plexus.Interop.Testing;
    using Plexus.Interop.Testing.Generated;
    using Shouldly;
    using Xunit;
    using Xunit.Abstractions;
    using UniqueId = Plexus.UniqueId;

    public class SpecificAppInstanceCallIntegrationTests : BaseClientBrokerTestsSuite
    {
        public SpecificAppInstanceCallIntegrationTests(ITestOutputHelper output, TestBrokerFixture testBrokerFixture) : base(output, testBrokerFixture)
        { }

        [Fact]
        public void InvokeTargetUsingConnectionId()
        {
            RunWith10SecTimeout(async () =>
            {
                var server1RequestCount = 0;
                var server1 = ConnectEchoServer((request, context) =>
                {
                    server1RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer1" });
                });

                var server2RequestCount = 0;
                var server2 = ConnectEchoServer((request, context) =>
                {
                    server2RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer2" });
                });

                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                server1RequestCount.ShouldBe(0);
                server2RequestCount.ShouldBe(0);

                var providedMethodReference = ProvidedMethodReference.CreateWithConnectionId(GreetingService.Id, GreetingService.HelloMethodId, server1.ApplicationId, server1.ConnectionId);
                var methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                var greetingRequest = new GreetingRequest { Name = "Client" };
                var response = await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor, greetingRequest);

                response.Greeting.ShouldBe("FromServer1");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(0);

                providedMethodReference = ProvidedMethodReference.CreateWithConnectionId(GreetingService.Id, GreetingService.HelloMethodId, server2.ApplicationId, server2.ConnectionId);
                methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                response = await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor, greetingRequest);

                response.Greeting.ShouldBe("FromServer2");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(1);
            });
        }

        [Fact]
        public void InvokeTargetUsingAppInstanceId()
        {
            RunWith10SecTimeout(async () =>
            {
                var server1RequestCount = 0;
                var server1 = ConnectEchoServer((request, context) =>
                {
                    server1RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer1" });
                });

                var server2RequestCount = 0;
                var server2 = ConnectEchoServer((request, context) =>
                {
                    server2RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer2" });
                });

                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                server1RequestCount.ShouldBe(0);
                server2RequestCount.ShouldBe(0);

                var providedMethodReference = ProvidedMethodReference.CreateWithAppInstanceId(GreetingService.Id, GreetingService.HelloMethodId, server1.ApplicationId, server1.ApplicationInstanceId);
                var methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                var greetingRequest = new GreetingRequest { Name = "Client" };
                var response = await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor, greetingRequest);

                response.Greeting.ShouldBe("FromServer1");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(0);

                providedMethodReference = ProvidedMethodReference.CreateWithAppInstanceId(GreetingService.Id, GreetingService.HelloMethodId, server2.ApplicationId, server2.ApplicationInstanceId);
                methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                response = await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor, greetingRequest);

                response.Greeting.ShouldBe("FromServer2");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(1);
            });
        }

        [Fact]
        public void InvokeTargetUsingAppInstanceIdWithoutAppId()
        {
            RunWith10SecTimeout(async () =>
            {
                var server1RequestCount = 0;
                var server1 = ConnectEchoServer((request, context) =>
                {
                    server1RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer1" });
                });

                var server2RequestCount = 0;
                var server2 = ConnectEchoServer((request, context) =>
                {
                    server2RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer2" });
                });

                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                server1RequestCount.ShouldBe(0);
                server2RequestCount.ShouldBe(0);

                var providedMethodReference = ProvidedMethodReference.CreateWithAppInstanceId(GreetingService.Id, GreetingService.HelloMethodId, server1.ApplicationInstanceId);
                var methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                var greetingRequest = new GreetingRequest { Name = "Client" };
                var response = await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor, greetingRequest);

                response.Greeting.ShouldBe("FromServer1");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(0);

                providedMethodReference = ProvidedMethodReference.CreateWithAppInstanceId(GreetingService.Id, GreetingService.HelloMethodId, server2.ApplicationInstanceId);
                methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                response = await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor, greetingRequest);

                response.Greeting.ShouldBe("FromServer2");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(1);
            });
        }

        [Fact]
        public void InvokeTargetUsingConnectionIdWithoutAppId()
        {
            RunWith10SecTimeout(async () =>
            {
                var server1RequestCount = 0;
                var server1 = ConnectEchoServer((request, context) =>
                {
                    server1RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer1" });
                });

                var server2RequestCount = 0;
                var server2 = ConnectEchoServer((request, context) =>
                {
                    server2RequestCount++;
                    return Task.FromResult(new GreetingResponse { Greeting = "FromServer2" });
                });

                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                server1RequestCount.ShouldBe(0);
                server2RequestCount.ShouldBe(0);

                var providedMethodReference = ProvidedMethodReference.CreateWithConnectionId(GreetingService.Id,
                    GreetingService.HelloMethodId, server1.ConnectionId);
                var methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                var greetingRequest = new GreetingRequest { Name = "Client" };
                var response =
                    await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor,
                        greetingRequest);

                response.Greeting.ShouldBe("FromServer1");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(0);

                providedMethodReference = ProvidedMethodReference.CreateWithConnectionId(GreetingService.Id,
                    GreetingService.HelloMethodId, server2.ConnectionId);
                methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                response = await client.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor,
                    greetingRequest);

                response.Greeting.ShouldBe("FromServer2");
                server1RequestCount.ShouldBe(1);
                server2RequestCount.ShouldBe(1);
            });
        }

        [Fact]
        public void InvokeApplicationBeforeItsConnection()
        {
            RunWith10SecTimeout(async () =>
            {
                Task<GreetingResponse> HandleAsync(GreetingRequest request, MethodCallContext context)
                {
                    return Task.FromResult(new GreetingResponse {Greeting = request.Name + "1"});
                }

                var brokerInstance = _testBrokerFixture.SharedInstance;
                var createdServersCount = 0;
                var createdServerClient = new TaskCompletionSource<IClient>();
                var echoServerFactory = new TestClientFactory(
                    (broker, id) =>
                    {
                        var optionsBuilder = new ClientOptionsBuilder()
                            .WithBrokerWorkingDir(brokerInstance.WorkingDir)
                            .WithAppInstanceId(id)
                            .WithApplicationId(EchoServerClient.Id)
                            .WithDefaultConfiguration()
                            .WithProvidedService(
                                GreetingService.Id,
                                x => x.WithUnaryMethod<GreetingRequest, GreetingResponse>(GreetingService.HelloMethodId,
                                    HandleAsync));
                        var serverClient = ClientFactory.Instance.Create(optionsBuilder.Build());
                        createdServerClient.SetResult(serverClient);
                        createdServersCount++;
                        return Task.FromResult(serverClient);
                    });

                var appLauncher = RegisterDisposable(
                    new TestAppLauncher(
                        brokerInstance,
                        new Dictionary<string, TestClientFactory>
                        {
                            {EchoServerClient.Id, echoServerFactory}
                        },
                        false
                    )
                );
                await appLauncher.StartAsync();

                var client1 = CreateClient<EchoClient>();
                await client1.ConnectAsync();

                var client2 = CreateClient<EchoClient>();
                await client2.ConnectAsync();

                var helloTask = client1.GreetingService.Hello(new GreetingRequest {Name = "Test1"}).ResponseAsync;
                var callUnconnectedServerTask = createdServerClient.Task.ContinueWith(async task =>
                {
                    var serverClient = task.Result;
                    await Task.Delay(TimeSpan.FromSeconds(1));
                    var providedMethodReference = ProvidedMethodReference.CreateWithAppInstanceId(GreetingService.Id,
                        GreetingService.HelloMethodId, EchoServerClient.Id, serverClient.ApplicationInstanceId);
                    var methodCallDescriptor = new MethodCallDescriptor(providedMethodReference);
                    await client2.CallInvoker.CallUnary<GreetingRequest, GreetingResponse>(methodCallDescriptor,
                        new GreetingRequest() {Name = "Test2"});
                }).Unwrap();

                var connectedServerAfterDelayTask = createdServerClient.Task.ContinueWith(async task =>
                {
                    var serverClient = task.Result;

                    await Task.Delay(TimeSpan.FromSeconds(3));

                    serverClient.ConnectionId.ShouldBe(UniqueId.Empty);
                    var onlineConnectionsResponse =
                        await client1.AppLifecycleService.GetConnections(new GetConnectionsRequest
                            {AppInstanceId = serverClient.ApplicationInstanceId});
                    onlineConnectionsResponse.Connections.Count.ShouldBe(0);

                    await serverClient.ConnectAsync();
                }).Unwrap();

                await Task.WhenAll(helloTask, callUnconnectedServerTask, connectedServerAfterDelayTask);

                createdServersCount.ShouldBe(1);
            });
        }

        private IClient ConnectEchoServer(UnaryMethodHandler<GreetingRequest, GreetingResponse> handleHello)
        {
            return ConnectEchoServer(builder => builder.WithProvidedService(GreetingService.Id, x => x.WithUnaryMethod(GreetingService.HelloMethodId, handleHello)));
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
