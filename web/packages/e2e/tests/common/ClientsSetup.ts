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
import { EchoClientClient, EchoClientClientBuilder } from "../../src/echo/client/EchoClientGeneratedClient";
import { EchoServerClient, EchoServerClientBuilder, EchoServiceInvocationHandler } from "../../src/echo/server/EchoServerGeneratedClient";
import { ConnectionProvider } from "./ConnectionProvider";
import * as plexus from "../../src/echo/gen/plexus-messages";
import * as Long from "long";

export class ClientsSetup {

    public async createEchoClients(transportConnectionProvider: ConnectionProvider, serviceHandler: EchoServiceInvocationHandler): Promise<[EchoClientClient, EchoServerClient]> {
        const server = await this.createEchoServer(transportConnectionProvider, serviceHandler);
        const client = await this.createEchoClient(transportConnectionProvider);
        return [client, server];
    }

    public createEchoClient(transportConnectionProvider: ConnectionProvider): Promise<EchoClientClient> {
        return new EchoClientClientBuilder()
            .withTransportConnectionProvider(transportConnectionProvider)
            .connect();
    }

    public createEchoServer(transportConnectionProvider: ConnectionProvider, serviceHandler: EchoServiceInvocationHandler): Promise<EchoServerClient> {
        return new EchoServerClientBuilder()
            .withEchoServiceInvocationsHandler(serviceHandler)
            .withTransportConnectionProvider(transportConnectionProvider)
            .connect();
    }

    public createRequestDto(): plexus.plexus.interop.testing.IEchoRequest {
        return {
            stringField: "stringData",
            int64Field: Long.fromInt(1234),
            uint32Field: 4321,
            repeatedDoubleField: [1, 2, 3],
            enumField: plexus.plexus.interop.testing.EchoRequest.SubEnum.value_one,
            subMessageField: {
                stringField: "subString",
                bytesField: new Uint8Array([5, 6, 7])
            },
            repeatedSubMessageField: [
                {
                    stringField: "subString",
                    bytesField: new Uint8Array([5, 6, 7])
                },
                {
                    stringField: "subString2",
                    bytesField: new Uint8Array([8, 9, 10])
                }
            ]
        };
    }

    public createHugeRequestDto(strLength: number): plexus.plexus.interop.testing.IEchoRequest {
        const text = (new Array(strLength)).join("x");
        return {
            stringField: text
        };
    }

    public createSimpleRequestDto(text: string): plexus.plexus.interop.testing.IEchoRequest {
        return {
            stringField: text
        };
    }

    public async disconnect(client: EchoClientClient, server: EchoServerClient): Promise<void> {
        await client.disconnect();
        console.log("Client disconnected");
        await server.disconnect();
        console.log("Server disconnected");
    }

}