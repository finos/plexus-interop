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
import { GenericClientFactory } from "../../src/client/generic/GenericClientFactory";
import { FramedTransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { when, mock, instance } from "ts-mockito";
import { CancellationToken } from "@plexus-interop/common";
import { ClientProtocolHelper as modelHelper } from "@plexus-interop/protocol";
import { BufferedChannel } from "./client-mocks";

describe("GenericClient", () => {

    it("Can be created if connect request/response handshake received", async () => {
        const mockedConnection = mock(FramedTransportConnection);
        const cancellationToken = new CancellationToken();
        const mockChannel = new BufferedChannel(cancellationToken);
        const id = UniqueId.generateNew();
        when(mockedConnection.createChannel()).thenReturn(Promise.resolve(mockChannel));
        when(mockedConnection.uuid()).thenReturn(id);
        const connection = instance(mockedConnection);

        const sut = new GenericClientFactory(connection);

        const clientPromise = sut.createClient({ applicationId: "appId" });
        const connectRequest = modelHelper.decodeConnectRequest(await mockChannel.pullOutMessage());
        expect(connectRequest).toBeDefined();
        expect(connectRequest.applicationId).toEqual("appId");

        mockChannel.addToInbox(modelHelper.connectResponsePayload({
            connectionId: UniqueId.generateNew()
        }));
        await clientPromise;
        cancellationToken.cancel("All done");
    });

    it("Can execute discovery operation", async () => {
        const cancellationToken = new CancellationToken();

        const mockedConnection = mock(FramedTransportConnection);
        let mockChannel = new BufferedChannel(cancellationToken);
        const id = UniqueId.generateNew();
        when(mockedConnection.createChannel()).thenReturn(Promise.resolve(mockChannel));
        when(mockedConnection.uuid()).thenReturn(id);
        const connection = instance(mockedConnection);

        const sut = new GenericClientFactory(connection);

        const clientPromise = sut.createClient({ applicationId: "appId" });
        modelHelper.decodeConnectRequest(await mockChannel.pullOutMessage());

        mockChannel.addToInbox(modelHelper.connectResponsePayload({
            connectionId: UniqueId.generateNew()
        }));

        const client = await clientPromise;

        mockChannel = new BufferedChannel(cancellationToken);
        when(mockedConnection.createChannel()).thenReturn(Promise.resolve(mockChannel));

        const discoveryResultPromise = client.discoverService({
            consumedService: {
                serviceId: "serviceId"
            }
        });

        const discoveryRequest = modelHelper.decodeServiceDiscoveryRequest(await mockChannel.pullOutMessage());
        expect(discoveryRequest).toBeDefined();
        if (discoveryRequest.consumedService) {
            expect(discoveryRequest.consumedService.serviceId).toEqual("serviceId");
        } else {
            fail("Consumed service is null");
        }

        mockChannel.addToInbox(modelHelper.discoveryResponsePayload(
            {
                services: [
                    {
                        consumedService: {
                            serviceId: "serviceId"
                        },
                        providedService: {
                            serviceId: "serviceId"
                        }
                    }
                ]
            }
        ));

        const response = await discoveryResultPromise;
        expect(response).toBeDefined();
        if (response.services) {
            expect(response.services[0].consumedService).toBeDefined();
            expect(response.services[0].providedService).toBeDefined();
        } else {
            fail("Response is empty");
        }
        cancellationToken.cancel("All done");
    });

});