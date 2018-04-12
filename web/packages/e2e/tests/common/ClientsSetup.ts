/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { EchoClientClient, EchoClientClientBuilder } from '../../src/echo/client/EchoClientGeneratedClient';
import { EchoServerClient, EchoServerClientBuilder, EchoServiceInvocationHandler, ServiceAliasInvocationHandler } from '../../src/echo/server/EchoServerGeneratedClient';
import { ConnectionProvider } from './ConnectionProvider';
import * as plexus from '../../src/echo/gen/plexus-messages';
import { TimeUtils } from '@plexus-interop/common';
import * as Long from 'long';
import { ConnectionSetup } from './ConnectionSetup';
import { NopServiceAliasHandler } from '../echo/NopServiceAliasHandler';

export class ClientsSetup {

    private clientConnectionSetup: ConnectionSetup | null = null;
    private serverConnectionSetup: ConnectionSetup | null = null;

    public constructor(private readonly clientConnectionDelay: number = 0) { }

    public async createEchoClients(
        transportConnectionProvider: ConnectionProvider,
        serviceHandler: EchoServiceInvocationHandler,
        aliasServiceHandler: ServiceAliasInvocationHandler = new NopServiceAliasHandler()): Promise<[EchoClientClient, EchoServerClient]> {
        const server = await this.createEchoServer(transportConnectionProvider, serviceHandler, aliasServiceHandler);
        const client = await this.createEchoClient(transportConnectionProvider);
        await TimeUtils.timeout(this.clientConnectionDelay);
        return [client, server];
    }

    public createEchoClient(transportConnectionProvider: ConnectionProvider): Promise<EchoClientClient> {
        return new EchoClientClientBuilder()
            .withTransportConnectionProvider(async () => {
                this.clientConnectionSetup = await transportConnectionProvider();
                return this.clientConnectionSetup.getConnection();
            })
            .connect();
    }

    public createEchoServer(
        transportConnectionProvider: ConnectionProvider,
        serviceHandler: EchoServiceInvocationHandler,
        aliasServiceHandler: ServiceAliasInvocationHandler = new NopServiceAliasHandler()): Promise<EchoServerClient> {
        return new EchoServerClientBuilder()
            .withEchoServiceInvocationsHandler(serviceHandler)
            .withServiceAliasInvocationsHandler(aliasServiceHandler)
            .withTransportConnectionProvider(async () => {
                this.serverConnectionSetup = await transportConnectionProvider();
                return this.serverConnectionSetup.getConnection();
            })
            .connect();
    }

    public getClientConnectionSetup(): ConnectionSetup {
        return (this.clientConnectionSetup as ConnectionSetup);
    }

    public getServerConnectionSetup(): ConnectionSetup {
        return (this.serverConnectionSetup as ConnectionSetup);
    }

    public createRequestDto(): plexus.plexus.interop.testing.IEchoRequest {
        return {
            stringField: 'stringData',
            int64Field: Long.fromInt(1234),
            uint32Field: 4321,
            repeatedDoubleField: [1, 2, 3],
            enumField: plexus.plexus.interop.testing.EchoRequest.SubEnum.value_one,
            subMessageField: {
                stringField: 'subString',
                bytesField: new Uint8Array([5, 6, 7])
            },
            repeatedSubMessageField: [
                {
                    stringField: 'subString',
                    bytesField: new Uint8Array([5, 6, 7])
                },
                {
                    stringField: 'subString2',
                    bytesField: new Uint8Array([8, 9, 10])
                }
            ]
        };
    }

    public createRequestOfBytes(numberOfBytes: number): plexus.plexus.interop.testing.IEchoRequest {
        const bytesField = Uint8Array.from(Array<number>(numberOfBytes).fill(1));
        return {
            subMessageField: {
                bytesField
            }
        };
    }

    public createHugeRequestDto(strLength: number): plexus.plexus.interop.testing.IEchoRequest {
        const text = (new Array(strLength)).join('x');
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
        await server.disconnect();
    }

}