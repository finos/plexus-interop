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

export class ClientInvocationTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testClientCanSendStreamToServer(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const serverHandler = new ClientStreamingHandler((context: MethodInvocationContext, hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>) => {
                return {
                    next: async (clientRequest) => {
                        hostClient.next(clientRequest);
                        hostClient.complete();
                    },
                    complete: () => { },
                    error: (e) => {
                        reject(e);
                    }
                };
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, serverHandler);
            const streamingClient = await client.getEchoServiceProxy().clientStreaming({
                next: (serverResponse) => { },
                error: (e) => {
                    console.error("Error received by client", e);
                    reject(e);
                },
                complete: async () => {
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                }
            });
            streamingClient.next(this.clientsSetup.createSimpleRequestDto("Hey"));
            streamingClient.complete();
        });
    }

}