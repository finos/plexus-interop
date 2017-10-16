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
import { StreamingInvocationClient, MethodInvocationContext } from "@plexus-interop/client";
import { EchoClientClient } from "../../src/echo/client/EchoClientGeneratedClient";
import { EchoServerClient } from "../../src/echo/server/EchoServerGeneratedClient";
import { AsyncHelper } from "@plexus-interop/common";

export class BidiStreamingInvocationTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testClientCanCancelInvocation(): Promise<void> {

        let serverReceivedError = false;
        let clientReceivedError = false;
        let serverReceivedMessage = false;

        return new Promise<void>((resolve, reject) => {
            const serverHandler = new ClientStreamingHandler((context: MethodInvocationContext, hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>) => {
                return {
                    next: (clientRequest) => {
                        serverReceivedMessage = true;
                    },
                    complete: () => reject("Complete not expected"),
                    error: (e) => {
                        serverReceivedError = true;
                    }
                }
            });
            try {
                (async () => {
                    const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, serverHandler);
                    const streamingClient = await client.getEchoServiceProxy().duplexStreaming({
                        next: (serverResponse) => reject("Not expected to receive message"),
                        error: (e) => {
                            debugger;
                            clientReceivedError = true;
                        },
                        complete: () => reject("Not expected to complete successfuly")
                    });
                    streamingClient.next(this.clientsSetup.createRequestDto());
                    await AsyncHelper.waitFor(() => serverReceivedMessage === true);
                    streamingClient.cancel();
                    await AsyncHelper.waitFor(() => serverReceivedError === true);
                    await AsyncHelper.waitFor(() => clientReceivedError === true);
                    await this.waitForClientConnectionCleared(this.clientsSetup);
                    await this.waitForServerConnectionCleared(this.clientsSetup);
                    await this.clientsSetup.disconnect(client as EchoClientClient, server as EchoServerClient);
                    resolve();

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
            const serverHandler = new ClientStreamingHandler((context: MethodInvocationContext, hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>) => {
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