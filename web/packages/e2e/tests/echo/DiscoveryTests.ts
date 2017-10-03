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
import { DiscoveredMethod, ProvidedMethodReference } from "@plexus-interop/client";
import { UnaryServiceHandler } from "./UnaryServiceHandler";

export class DiscoveryTests extends BaseEchoTest {


    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testMethodDiscoveredByInputMessageId(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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
                })
                .then(() => resolve())
                .catch(error => reject(error));
        });
    }

    public testClientCanInvokeDiscoveredMethod(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const echoRequest = this.clientsSetup.createRequestDto();
            const handler = new UnaryServiceHandler(async (request) => request);
            return this.clientsSetup.createEchoClients(this.connectionProvider, handler)
                .then(clients => {
                    const client = clients[0];
                    return client.discoverMethod({
                        consumedMethod: {
                            consumedService: {
                                serviceId: "plexus.interop.testing.EchoService"
                            },
                            methodId: "Unary"
                        }
                    })
                    .then(discoveryResponse => {
                        debugger;
                        if (discoveryResponse.methods) {
                            expect(discoveryResponse.methods.length).to.be.eq(1);
                            const method = discoveryResponse.methods[0];
                            this.assertDiscoveredMethodValid(method);
                            // invoke discovered
                            return new Promise((invocationResolve, invocationReject) => {
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
                    })
                    .then(() => {
                        return this.clientsSetup.disconnect(clients[0], clients[1]);
                    });
                })
                .then(() => resolve())
                .catch(error => reject(error));
        });
    }

    private assertDiscoveredMethodValid(discoveredMethod: DiscoveredMethod) {
        expect(discoveredMethod.providedMethod).to.not.be.undefined;
        expect(discoveredMethod.inputMessageId).to.not.be.undefined;
        expect(discoveredMethod.outputMessageId).to.not.be.undefined;
    }

    public testMethodDiscoveredByOutputMessageId(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this.clientsSetup.createEchoClients(this.connectionProvider, new NopServiceHandler())
                .then(clients => {
                    const client = clients[0];
                    return client.discoverMethod({outputMessageId: "plexus.interop.testing.EchoRequest" })
                        .then(discoveryResponse => {
                            if (discoveryResponse.methods) {
                                expect(discoveryResponse.methods.length).to.be.eq(4);
                                discoveryResponse.methods.forEach(
                                    method => this.assertDiscoveredMethodValid(method));                                
                            } else {
                                throw "Empty response";
                            }
                        })
                        .then(() => {
                            return this.clientsSetup.disconnect(clients[0], clients[1]);
                        });
                })
                .then(() => resolve())
                .catch(error => reject(error));
        });
    }

    public testMethodDiscoveredByReference(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this.clientsSetup.createEchoClients(this.connectionProvider, new NopServiceHandler())
                .then(clients => {
                    const client = clients[0];
                    return client.discoverMethod({
                        consumedMethod: {
                            consumedService: {
                                serviceId: "plexus.interop.testing.EchoService"
                            },
                            methodId: "Unary"
                        }
                    })
                    .then(discoveryResponse => {
                        if (discoveryResponse.methods) {
                            expect(discoveryResponse.methods.length).to.be.eq(1);
                            discoveryResponse.methods.forEach(
                                method => this.assertDiscoveredMethodValid(method));
                        } else {
                            throw "Empty response";
                        }
                    })
                    .then(() => {
                        return this.clientsSetup.disconnect(clients[0], clients[1]);
                    });
                })
                .then(() => resolve())
                .catch(error => reject(error));
        });
    }

}