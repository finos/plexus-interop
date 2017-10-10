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
import { ConnectionProvider } from "../common/ConnectionProvider";
import { ClientsSetup } from "../common/ClientsSetup";
import { ServerStreamingHandler } from "./ServerStreamingHandler";
import { BaseEchoTest } from "./BaseEchoTest";
import * as plexus from "../../src/echo/gen/plexus-messages";
import { ClientError } from "@plexus-interop/protocol";
import { expect } from "chai";

export class ServerStreamingInvocationTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testServerSendsStreamToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (request, hostClient) => {
                try {
                    await this.assertEqual(request, echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.complete();
                } catch (error) {
                    console.error("Failed", error);
                    reject(error);
                }
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
            const responses: plexus.plexus.interop.testing.IEchoRequest[] = [];
            
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: (response) => {
                    console.log("Received");
                    responses.push(response);
                },
                complete: async () => {
                    expect(responses.length).is.eq(3);
                    responses.forEach(r => this.assertEqual(r, echoRequest));
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                },
                error: (e) => {
                    reject(e);
                }
            });
        });
    }

    public testServerSendsStreamWithErrorToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (request, hostClient) => {
                try {
                    await this.assertEqual(request, echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.error(new ClientError("Host error", "Error Details"));
                    console.log("All sent");
                } catch (error) {
                    console.error("Failed", error);
                    reject(error);
                }
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
            const responses: plexus.plexus.interop.testing.IEchoRequest[] = [];
            
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: (response) => {
                    console.log("Received");
                    responses.push(response);
                },
                complete: async () => {
                    reject("Not expected to be completed");
                },
                error: async (e) => {
                    console.log("Error", JSON.stringify(e));
                    expect(responses.length).is.eq(1);
                    responses.forEach(r => this.assertEqual(r, echoRequest));
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                }
            });
        });
    }

    public testServerSendsFewStreamsInParrallelToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (request, hostClient) => {
                try {
                    await this.assertEqual(request, echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.complete();
                } catch (error) {
                    console.error("Failed", error);
                    reject(error);
                }
            });
            
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
            
            let firstCompleted = false;
            let secondCompleted = false;

            // first
            const firstResponses: plexus.plexus.interop.testing.IEchoRequest[] = [];
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: (response) => firstResponses.push(response),
                complete: async () => {
                    firstCompleted = true;
                    expect(firstResponses.length).is.eq(3);
                    firstResponses.forEach(r => this.assertEqual(r, echoRequest));
                    if (secondCompleted) { 
                        await this.clientsSetup.disconnect(client, server);
                        resolve(); 
                    }
                },
                error: (e) => reject(e)
            });

            // second
            const secondResponses: plexus.plexus.interop.testing.IEchoRequest[] = [];            
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: (response) => secondResponses.push(response),
                complete: async () => {
                    secondCompleted = true;
                    expect(secondResponses.length).is.eq(3);
                    secondResponses.forEach(r => this.assertEqual(r, echoRequest));
                    if (firstCompleted) { 
                        await this.clientsSetup.disconnect(client, server);
                        resolve(); 
                    }
                },
                error: (e) => reject(e)
            });
        });
    }

    public testServerSendsStreamWithCancelToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (request, hostClient) => {
                try {
                    await this.assertEqual(request, echoRequest);
                    await hostClient.next(echoRequest);
                    await hostClient.cancel();
                    console.log("Operation cancelled");
                } catch (error) {
                    console.error("Failed", error);
                    reject(error);
                }
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
            const responses: plexus.plexus.interop.testing.IEchoRequest[] = [];
            
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: (response) => {
                    console.log("Received");
                    responses.push(response);
                },
                complete: async () => {
                    reject("Not expected to be completed");
                },
                error: async (e) => {
                    console.log("Error", JSON.stringify(e));
                    expect(responses.length).is.eq(1);
                    responses.forEach(r => this.assertEqual(r, echoRequest));
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                }
            });
        });
    }

}