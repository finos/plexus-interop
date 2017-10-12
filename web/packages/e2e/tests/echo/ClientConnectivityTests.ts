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
import { UnaryServiceHandler } from "./UnaryServiceHandler";
import { BaseEchoTest } from "./BaseEchoTest";
import * as plexus from "../../src/echo/gen/plexus-messages";
import { ClientError } from "@plexus-interop/protocol";
import { expect } from "chai";
import { ServerStreamingHandler } from "./ServerStreamingHandler";
import { MethodInvocationContext } from "@plexus-interop/client";
import { EchoClientClient } from "../../src/echo/client/EchoClientGeneratedClient";
import { EchoServerClient } from "../../src/echo/server/EchoServerGeneratedClient";

export class ClientConnectivityTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
            super();
    }

    public testAllInvocationClientsReceiveErrorOnClientDisconnect(): Promise<void> {

        const echoRequest = this.clientsSetup.createRequestDto();
        let serverStreamingContext: MethodInvocationContext | null = null;
        let client: EchoClientClient | null = null;
        let server: EchoServerClient | null = null;
        return new Promise<void>(async (testResolve, testError) => {
            
            let handler: ServerStreamingHandler | null = null;
            
            const serverRequestReceived = new Promise(async (serverRequestResolve) => {
                handler = new ServerStreamingHandler(async (context, request, hostClient) => {
                    serverStreamingContext = context;
                    serverRequestResolve();
                });
                [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler as ServerStreamingHandler);
                console.log("Clients created");
            });

            const serverStreamingInvocationErrorReceived = new Promise((clientErrorResolve, clientErrorReject) => {
                (client as EchoClientClient).getEchoServiceProxy().serverStreaming(echoRequest, {
                    next: (r) => clientErrorReject("Not expected to receive update"),
                    complete: () => clientErrorReject("Not expected to complete"),
                    error: (e) => {
                        clientErrorResolve();
                    }
                });
            });

            await serverRequestReceived
            console.log("Request received");
            await (client as EchoClientClient).disconnect();
            console.log("Client disconnected");            
            await serverStreamingInvocationErrorReceived;       
            console.log("Server error received");
            if (!(serverStreamingContext as MethodInvocationContext)
                    .cancellationToken
                    .isCancelled()) {
                testError("Server must be cancelled");
            }
            await (server as EchoServerClient).disconnect();
            console.log("Server disconnected");
            testResolve();
            
        });
    }
}