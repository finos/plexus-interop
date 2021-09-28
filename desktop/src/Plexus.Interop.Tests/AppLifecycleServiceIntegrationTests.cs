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
    using Plexus.Channels;
    using Plexus.Interop.Testing;
    using Plexus.Interop.Testing.Generated;
    using Plexus.Interop.Transport.Protocol;
    using Shouldly;
    using Xunit;
    using Xunit.Abstractions;

    public class AppLifecycleServiceIntegrationTests : BaseClientBrokerTestsSuite
    {
        public AppLifecycleServiceIntegrationTests(ITestOutputHelper output, TestBrokerFixture testBrokerFixture) : base(output, testBrokerFixture)
        { }

        [Fact]
        public void EmptyGetConnectionsRequestReturnsAllConnections()
        {
            RunWith10SecTimeout(async () =>
            {
                for (int i = 1; i < 10; i++)
                {
                    var client = CreateClient<EchoClient>();
                    await client.ConnectAsync();

                    var response = await client.AppLifecycleService.GetConnections(new GetConnectionsRequest());
                    response.Connections.Count.ShouldBeGreaterThan(i);
                    response.Connections.FirstOrDefault(descriptor => descriptor.AppId == EchoClient.Id && descriptor.AppInstanceId.Equals(client.ApplicationInstanceId)).ShouldNotBeNull();
                }
            });
        }

        [Fact]
        public void GetConnectionRequestByConnectionId()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                var testClient = CreateClient<EchoClient>();
                await testClient.ConnectAsync();

                var request = new GetConnectionsRequest { ConnectionId = testClient.ConnectionId };

                var response = await client.AppLifecycleService.GetConnections(request);
                response.Connections.Count.ShouldBe(1);
                var descriptor = response.Connections.Single();
                descriptor.AppId.ShouldBe(testClient.ApplicationId);
                descriptor.AppInstanceId.ShouldBe(testClient.ApplicationInstanceId);
                descriptor.ConnectionId.ShouldBe(testClient.ConnectionId);

                await testClient.DisconnectAsync();

                await Should.ThrowAsync<RemoteErrorException>(async () => await client.AppLifecycleService.GetConnections(request));
            });
        }

        [Fact]
        public void GetConnectionRequestByAppId()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                var clients = new List<EchoClient>();
                for (int i = 0; i < 10; i++)
                {
                    clients.Add(CreateClient<EchoClient>());
                }

                await Task.WhenAll(clients.Select(echoClient => echoClient.ConnectAsync()));

                var request = new GetConnectionsRequest { ApplicationId = EchoClient.Id };
                var connections = (await client.AppLifecycleService.GetConnections(request)).Connections;
                foreach (var echoClient in clients)
                {
                    connections.FirstOrDefault(descriptor => descriptor.AppId == EchoClient.Id && descriptor.AppInstanceId.Equals(echoClient.ApplicationInstanceId) && descriptor.ConnectionId.Equals(echoClient.ConnectionId)).ShouldNotBeNull();
                }
            });
        }

        [Fact]
        public void GetConnectionRequestByAppInstanceId()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                var testClient = CreateClient<EchoClient>();

                var request = new GetConnectionsRequest { AppInstanceId = testClient.ApplicationInstanceId };

                var response = await client.AppLifecycleService.GetConnections(request);
                response.Connections.Count.ShouldBe(0);

                await testClient.ConnectAsync();

                response = await client.AppLifecycleService.GetConnections(request);
                response.Connections.Count.ShouldBe(1);
                var descriptor = response.Connections.Single();
                descriptor.AppId.ShouldBe(testClient.ApplicationId);
                descriptor.AppInstanceId.ShouldBe(testClient.ApplicationInstanceId);
                descriptor.ConnectionId.ShouldBe(testClient.ConnectionId);
            });
        }

        [Fact]
        public void GetConnectionRequestByAppIdAndAppInstanceId()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                var testClient = CreateClient<EchoClient>();

                var request = new GetConnectionsRequest { AppInstanceId = testClient.ApplicationInstanceId, ApplicationId = testClient.ApplicationId };

                await Should.ThrowAsync<RemoteErrorException>(async () => await client.AppLifecycleService.GetConnections(request));

                await testClient.ConnectAsync();

                var response = await client.AppLifecycleService.GetConnections(request);
                response.Connections.Count.ShouldBe(1);
                var descriptor = response.Connections.Single();
                descriptor.AppId.ShouldBe(testClient.ApplicationId);
                descriptor.AppInstanceId.ShouldBe(testClient.ApplicationInstanceId);
                descriptor.ConnectionId.ShouldBe(testClient.ConnectionId);
            });
        }

        [Fact]
        public void GetConnectionEventsByAppInstanceId()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                var testClient = CreateClient<EchoClient>();

                var request = new GetConnectionsRequest { AppInstanceId = testClient.ApplicationInstanceId };

                var responseStream = client.AppLifecycleService.GetConnectionsStream(request).ResponseStream;
                var initialCollection = await responseStream.ReadAsync();
                initialCollection.EventCase.ShouldBe(GetConnectionsEvent.EventOneofCase.None);
                initialCollection.Connections.Count.ShouldBe(0);

                responseStream.TryRead(out _).ShouldBeFalse();

                await testClient.ConnectAsync();

                var connectionEvent = await responseStream.ReadAsync();
                connectionEvent.EventCase.ShouldBe(GetConnectionsEvent.EventOneofCase.NewConnection);
                connectionEvent.NewConnection.ConnectionId.ShouldBe(testClient.ConnectionId);
                connectionEvent.Connections.Count.ShouldBe(1);

                responseStream.TryRead(out _).ShouldBeFalse();

                await testClient.DisconnectAsync();
                var disconnectEvent = await responseStream.ReadAsync();
                disconnectEvent.EventCase.ShouldBe(GetConnectionsEvent.EventOneofCase.ClosedConnection);
                disconnectEvent.ClosedConnection.ConnectionId.ShouldBe(testClient.ConnectionId);
                disconnectEvent.Connections.Count.ShouldBe(0);

                responseStream.TryRead(out _).ShouldBeFalse();
            });
        }

        [Fact]
        public void GetConnectionEventsByConnectionId()
        {
            RunWith10SecTimeout(async () =>
            {
                var client = CreateClient<EchoClient>();
                await client.ConnectAsync();

                var testClient = CreateClient<EchoClient>();
                await testClient.ConnectAsync();

                var request = new GetConnectionsRequest { ConnectionId = testClient.ConnectionId };

                var responseStream = client.AppLifecycleService.GetConnectionsStream(request).ResponseStream;
                var initialCollection = await responseStream.ReadAsync();
                initialCollection.EventCase.ShouldBe(GetConnectionsEvent.EventOneofCase.None);
                initialCollection.Connections.Count.ShouldBe(1);

                responseStream.TryRead(out _).ShouldBeFalse();

                await testClient.DisconnectAsync();

                var disconnectEvent = await responseStream.ReadAsync();
                disconnectEvent.EventCase.ShouldBe(GetConnectionsEvent.EventOneofCase.ClosedConnection);
                disconnectEvent.ClosedConnection.ConnectionId.ShouldBe(testClient.ConnectionId);
                disconnectEvent.Connections.Count.ShouldBe(0);

                responseStream.TryRead(out _).ShouldBeFalse();
            });
        }
    }
}
