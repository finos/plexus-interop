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
import { BaseEchoTest } from "./BaseEchoTest";
import * as plexus from "../../src/echo/gen/plexus-messages";
import { ClientStreamingHandler } from "./ClientStreamingHandler";
import { StreamingInvocationClient } from "@plexus-interop/client";
import { EchoClientClient } from "../../src/echo/client/EchoClientGeneratedClient";
import { EchoServerClient } from "../../src/echo/server/EchoServerGeneratedClient";

export class BidiStreamingInvocationTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testClientCanCancelInvocation(): Promise<void> {
        let client: EchoClientClient | null = null;
        let server: EchoServerClient | null = null;
        let serverReceivedError = false;
        let clientReceivedError = false;
        return new Promise<void>((resolve, reject) => {
            const serverHandler = new ClientStreamingHandler((hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>) => {
                return {
                    next: (clientRequest) => reject("Not expected"),
                    complete: () => reject("Complete not expected"),
                    error: async (e) => {
                        console.log("Error received by server", e);
                        this.verifyServerChannelsCleared(this.clientsSetup).catch(e => reject(e));
                        serverReceivedError = true;
                        if (clientReceivedError) {
                            this.clientsSetup.disconnect(client as EchoClientClient, server as EchoServerClient)
                                .then(() => resolve());
                        }
                    }
                }
            });
            try {
                (async () => {
                    [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, serverHandler);
                    const streamingClient = await client.getEchoServiceProxy().duplexStreaming({
                        next: (serverResponse) => {
                            reject("Not expected to receive message");
                        },
                        error: (e) => {
                            console.log(JSON.stringify(e));
                            this.verifyClientChannelsCleared(this.clientsSetup).catch(e => reject(e));
                            clientReceivedError = true;                            
                            if (serverReceivedError) {
                                this.clientsSetup.disconnect(client as EchoClientClient, server as EchoServerClient)
                                    .then(() => resolve());
                            }
                        },
                        complete: () =>  reject("Not expected to complete successfuly")
                    });
                    await streamingClient.cancel();
                    console.log("Client cancelled");
                })();
            } catch (error) {
                reject(error);
            }
        });
    }

    public testClientAndServerCanSendMessages(): Promise<void> {
        let client: EchoClientClient | null = null;
        let server: EchoServerClient | null = null;
        return new Promise<void>((resolve, reject) => {
            const serverHandler = new ClientStreamingHandler((hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>) => {
                return {
                    next: async (clientRequest) => {
                        if (clientRequest.stringField === "Hey") {
                            hostClient.next(this.clientsSetup.createSimpleRequestDto("Hey"));
                        } else if (clientRequest.stringField === "Ping") {
                            hostClient.next(this.clientsSetup.createSimpleRequestDto("Pong"));
                            await hostClient.complete();
                            this.verifyServerChannelsCleared(this.clientsSetup)
                                .catch(e => reject(e));
                        }
                    },
                    complete: () => { },
                    error: (e) => {
                        console.error("Error received by server", e);
                        reject(e);
                    }
                }
            });
            (async () => {
                [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, serverHandler);
                const streamingClient = await client.getEchoServiceProxy().duplexStreaming({
                    next: (serverResponse) => {
                        if (serverResponse.stringField === "Hey") {
                            streamingClient.next(this.clientsSetup.createSimpleRequestDto("Ping"));
                        } else if (serverResponse.stringField === "Pong") {
                            streamingClient.complete().then(() => {
                                this.verifyClientChannelsCleared(this.clientsSetup)
                                    .catch(e => reject(e));
                                return this.clientsSetup.disconnect(client as EchoClientClient, server as EchoServerClient);
                            })
                            .then(() => resolve())
                            .catch(e => reject(e));
                        }
                    },
                    error: (e) => {
                        console.error("Error received by client", e);
                        reject(e);
                    },
                    complete: () => {
                        console.log("Remote completed");
                    }
                });
                streamingClient.next(this.clientsSetup.createSimpleRequestDto("Hey"));
            })();

        });
    }

}