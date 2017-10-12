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
import { ClientsSetup } from "../common/ClientsSetup";
import { ConnectionProvider } from "../common/ConnectionProvider";
import { BaseEchoTest } from "./BaseEchoTest";
import * as plexus from "../../src/echo/gen/plexus-messages";
import { NopServiceHandler } from "./NopServiceHandler";
import { expect } from "chai";
import { DiscoveredMethod, ProvidedMethodReference, DiscoveredServiceMethod } from "@plexus-interop/client";
import { UnaryServiceHandler } from "./UnaryServiceHandler";

export class DiscoveryTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testMethodDiscoveredByInputMessageId(): Promise<void> {
        return this.clientsSetup.createEchoClients(this.connectionProvider, new NopServiceHandler())
            .then(clients => {
                const client = clients[0];
                return client.discoverMethod({ inputMessageId: "plexus.interop.testing.EchoRequest" })
                    .then(discoveryResponse => {
                        if (discoveryResponse.methods) {
                            expect(discoveryResponse.methods.length).to.be.eq(4);
                            discoveryResponse.methods.forEach(method => this.assertDiscoveredMethodValid(method));
                        } else {
                            throw "Empty response";
                        }
                    })
                    .then(() => {
                        return this.clientsSetup.disconnect(clients[0], clients[1]);
                    });
            });
    }

    public async testServiceDiscoveredById(): Promise<void> {
        const serviceId = "plexus.interop.testing.EchoService";
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, new NopServiceHandler());
        const serviceDiscoveryResponse = await client.discoverService({
            consumedService: {
                serviceId
            }
        });
        if (serviceDiscoveryResponse.services) {
            expect(serviceDiscoveryResponse.services.length).to.be.eq(1);
            const serviceRef = serviceDiscoveryResponse.services[0];
            if (serviceRef.consumedService) {
                expect(serviceRef.consumedService.serviceId).to.eq(serviceId);
            } else {
                throw "Empty consumed service";
            }
            if (serviceRef.providedService) {
                expect(serviceRef.providedService.applicationId).to.eq("plexus.interop.testing.EchoServer");
                expect(serviceRef.providedService.connectionId).to.not.be.undefined;
                expect(serviceRef.providedService.serviceId).to.eq(serviceId);
            } else {
                throw "Empty provided service";
            }
            if (serviceRef.methods) {
                expect(serviceRef.methods.length).to.be.eq(4);
                serviceRef.methods.forEach(method => this.assertDiscoveredServiceMethodValid(method));
            } else {
                throw "Empty methods";
            }
        } else {
            throw "Empty Response";
        }
        await this.clientsSetup.disconnect(client, server);
    }

    public async testServiceDiscoveryReceivesEmptyResponseForWrongId(): Promise<void> {
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, new NopServiceHandler());
        const serviceDiscoveryResponse = await client.discoverService({
            consumedService: {
                serviceId: "plexus.interop.testing.DoNotExist"
            }
        });
        if (serviceDiscoveryResponse.services) {
            expect(serviceDiscoveryResponse.services.length).to.be.eq(0);
        }
        await this.clientsSetup.disconnect(client, server);
    }

    public async testClientCanInvokeDiscoveredMethod(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        const handler = new UnaryServiceHandler(async (context, request) => request);
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler)
        const discoveryResponse = await client.discoverMethod({
            consumedMethod: {
                consumedService: {
                    serviceId: "plexus.interop.testing.EchoService"
                },
                methodId: "Unary"
            }
        });
        if (discoveryResponse.methods) {
            expect(discoveryResponse.methods.length).to.be.eq(1);
            const method = discoveryResponse.methods[0];
            this.assertDiscoveredMethodValid(method);
            // invoke discovered
            await new Promise((invocationResolve, invocationReject) => {
                client.sendDiscoveredUnaryRequest(
                    method.providedMethod as ProvidedMethodReference,
                    this.encodeRequestDto(echoRequest), {
                        value: (response: ArrayBuffer) => {
                            const echoResponse = this.decodeRequestDto(response);
                            this.assertEqual(echoRequest, echoResponse);
                            invocationResolve();
                        },
                        error: (e) => invocationReject(e)
                    });
            });
        } else {
            throw "Empty response";
        }
        await this.clientsSetup.disconnect(client, server);
    }

    private assertDiscoveredMethodValid(discoveredMethod: DiscoveredMethod) {
        expect(discoveredMethod.providedMethod).to.not.be.undefined;
        expect(discoveredMethod.inputMessageId).to.be.eq("plexus.interop.testing.EchoRequest");
        expect(discoveredMethod.outputMessageId).to.be.eq("plexus.interop.testing.EchoRequest");
    }

    private assertDiscoveredServiceMethodValid(discoveredMethod: DiscoveredServiceMethod) {
        expect(discoveredMethod.methodId).to.not.be.undefined;
        expect(discoveredMethod.methodTitle).to.not.be.undefined;
        expect(discoveredMethod.inputMessageId).to.be.eq("plexus.interop.testing.EchoRequest");
        expect(discoveredMethod.outputMessageId).to.be.eq("plexus.interop.testing.EchoRequest");
    }

    public async testMethodDiscoveredByOutputMessageId(): Promise<void> {
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, new NopServiceHandler());
        const discoveryResponse = await client.discoverMethod({ outputMessageId: "plexus.interop.testing.EchoRequest" });
        if (discoveryResponse.methods) {
            expect(discoveryResponse.methods.length).to.be.eq(4);
            discoveryResponse.methods.forEach(
                method => this.assertDiscoveredMethodValid(method));
        } else {
            throw "Empty response";
        }
        await this.clientsSetup.disconnect(client, server);
    }

    public async testMethodDiscoveredByReference(): Promise<void> {
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, new NopServiceHandler());
        const discoveryResponse = await client.discoverMethod({
            consumedMethod: {
                consumedService: {
                    serviceId: "plexus.interop.testing.EchoService"
                },
                methodId: "Unary"
            }
        });
        if (discoveryResponse.methods) {
            expect(discoveryResponse.methods.length).to.be.eq(1);
            discoveryResponse.methods.forEach(
                method => this.assertDiscoveredMethodValid(method));
        } else {
            throw "Empty response";
        }
        await this.clientsSetup.disconnect(client, server);
    }

}