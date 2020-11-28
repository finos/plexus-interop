namespace Plexus.Interop
{
    using System;
    using System.Threading.Tasks;
    using Plexus.Interop.Testing;
    using Plexus.Interop.Testing.Generated;
    using Shouldly;
    using Xunit;
    using Xunit.Abstractions;

    public class ProvidedMethodReferenceIntegrationTests : BaseClientBrokerTestsSuite
    {
        public ProvidedMethodReferenceIntegrationTests(ITestOutputHelper output, TestBrokerFixture testBrokerFixture) : base(output, testBrokerFixture)
        { }

        [Fact]
        public async Task InvokeTargetUsingConnectionId()
        {
            var server1RequestCount = 0;
            var server1 = ConnectEchoServer((request, context) =>
            {
                server1RequestCount++;
                return Task.FromResult(new GreetingResponse {Greeting = "FromServer1"});
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
            var greetingRequest = new GreetingRequest {Name = "Client"};
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
        }

        [Fact]
        public async Task InvokeTargetUsingAppInstanceId()
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
