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
import { ServerStreamingHandler } from "./ServerStreamingHandler";
import { EchoClientClient, EchoClientClientBuilder } from "../../src/echo/client/EchoClientGeneratedClient";
import { EchoServerClient } from "../../src/echo/server/EchoServerGeneratedClient";
import { UniqueId } from "@plexus-interop/transport-common";

export class ClientConnectivityTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testInvocationClientReceiveErrorOnClientDisconnect(): Promise<void> {
        return this.testAllInvocationClientReceiveErrorOnDisconnect(true, false);
    }

    public async testClientReceiveErrorIfProvideWrongId(): Promise<void> {
        const preparedBuilder = new EchoClientClientBuilder()
            .withClientDetails({
                applicationId: "plexus.interop.testing.DoNotExist",
                applicationInstanceId: UniqueId.generateNew()
            })
            .withTransportConnectionProvider(() => this.connectionProvider().then(c => c.getConnection()));
        try {
            await preparedBuilder.connect();
        } catch (error) {
            return Promise.resolve();
        }
        throw new Error("Expect to fail to receive connection");
    }

    private testAllInvocationClientReceiveErrorOnDisconnect(isForcedByClient: boolean, isForcedByServer: boolean): Promise<void> {

        const echoRequest = this.clientsSetup.createRequestDto();
        let client: EchoClientClient | null = null;
        let server: EchoServerClient | null = null;

        return new Promise<void>(async (testResolve, testError) => {

            let handler: ServerStreamingHandler | null = null;
            let clientInvocationErrorReceived: Promise<void> | null = null;

            const serverRequestReceived = new Promise(async (serverRequestResolve) => {
                handler = new ServerStreamingHandler(async (context, request, hostClient) => {
                    serverRequestResolve();
                });
                [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler as ServerStreamingHandler);
                clientInvocationErrorReceived = new Promise<void>((clientErrorResolve, clientErrorReject) => {
                    (client as EchoClientClient).getEchoServiceProxy().serverStreaming(echoRequest, {
                        next: (r) => {
                            clientErrorReject("Not expected to receive update");
                        },
                        complete: () => {}, // TOOD uncomment and fix clientErrorReject("Complete not expected"),
                        error: (e) => {
                            clientErrorResolve();
                        }
                    });
                });
            });

            await serverRequestReceived;
            if (isForcedByClient) {
                (client as EchoClientClient).disconnect();
            }

            if (isForcedByServer) {
                (server as EchoServerClient).disconnect();
            }

            await clientInvocationErrorReceived;

            if (!isForcedByServer) {
                await (server as EchoServerClient).disconnect();
            }

            if (!isForcedByClient) {
                await (client as EchoClientClient).disconnect();
            }

            testResolve();

        });
    }
}