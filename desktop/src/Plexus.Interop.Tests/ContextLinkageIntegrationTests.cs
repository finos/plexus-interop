/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
    using Plexus.Interop.Testing;
    using Plexus.Interop.Testing.Generated;
    using Shouldly;
    using Xunit;
    using Xunit.Abstractions;

    public class ContextLinkageIntegrationTests : BaseClientBrokerTestsSuite
    {
        public ContextLinkageIntegrationTests(ITestOutputHelper output, TestBrokerFixture testBrokerFixture) 
            : base(output, testBrokerFixture)
        { }

        [Fact]
        public void NewAppInstanceWillBeLaunchedOnInvocationWithinContext()
        {
            var serverCreatedCount = 0;

            Task<GreetingResponse> HandleAsync(GreetingRequest greetingRequest, MethodCallContext context)
            {
                return Task.FromResult(new GreetingResponse { Greeting = greetingRequest.Name + (serverCreatedCount) });
            }

            RunWith10SecTimeout(async () =>
            {
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
                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                var result1 = await client.GreetingService.Hello(new GreetingRequest { Name = "Test1" });
                result1.Greeting.ShouldBe("Test11");

                var result2 = await client.GreetingService.Hello(new GreetingRequest { Name = "Test2" });
                result2.Greeting.ShouldBe("Test21");

                serverCreatedCount.ShouldBe(1);

                var newContext = await client.ContextLinkageService.CreateContext(new Empty());
                var allContexts = await client.ContextLinkageService.GetContexts(new Empty());

                allContexts.Contexts.Count.ShouldBe(1);
                allContexts.Contexts[0].Id.ShouldBe(newContext.Id);

                var result3 = await client.CallInvoker.Call(
                    GreetingService.DefaultDescriptor.HelloMethod,
                    new GreetingRequest { Name = "Test3" },
                    ContextLinkageOptions.WithCurrentContext());

                result3.Greeting.ShouldBe("Test32");

                serverCreatedCount.ShouldBe(2);

                WriteLog("Starting to read context loaded stream");

                var contextStatus = await client.ContextLinkageService.ContextLoadedStream(newContext).ResponseStream
                    .FirstAsync(update => update.LoadedAppDescriptors.Any(appDescriptor => appDescriptor.AppId == EchoServerClient.Id));

                contextStatus.LoadedAppDescriptors.Any(descriptor => descriptor.AppId == EchoClient.Id);

                var linkedInvocations = await client.ContextLinkageService.GetLinkedInvocations(newContext);

                linkedInvocations.Invocations
                    .Single(reference => reference.AppInfo.ProvidedServices.Any(service => service.ServiceId == GreetingService.Id))
                    .ShouldNotBeNull();
            });
        }

        [Fact]
        public void ShouldReceiveContextLoadedEventWhenApplicationConnected()
        {
            RunWith5SecTimeout(async () =>
            {
                var client1 = CreateClient<EchoClient>();
                await client1.ConnectAsync();

                var newContext = await client1.ContextLinkageService.CreateContext(new Empty());

                var contextStatusUpdateStream = client1.ContextLinkageService.ContextLoadedStream(newContext).ResponseStream;

                var client2 = CreateClient<EchoClient>();
                await client2.ConnectAsync();

                var contextLoadingUpdate = await contextStatusUpdateStream.FirstAsync();
                contextLoadingUpdate.Status.ShouldBe(ContextLoadingStatus.Finished);
                contextLoadingUpdate.LoadedAppDescriptors.Count.ShouldBe(1);

                await client2.ContextLinkageService.JoinContext(newContext);

                contextLoadingUpdate = await contextStatusUpdateStream.FirstAsync(update =>
                    update.Status == ContextLoadingStatus.Finished && update.LoadedAppDescriptors.Count == 2);

                contextLoadingUpdate.LoadedAppDescriptors.ShouldContain(descriptor => descriptor.AppInstanceId.Equals(client1.ApplicationInstanceId));
                contextLoadingUpdate.LoadedAppDescriptors.ShouldContain(descriptor => descriptor.AppInstanceId.Equals(client2.ApplicationInstanceId));
            });
        }
    }
}
