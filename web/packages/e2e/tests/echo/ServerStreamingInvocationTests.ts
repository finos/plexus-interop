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
import { ConnectionProvider } from '../common/ConnectionProvider';
import { ClientsSetup } from '../common/ClientsSetup';
import { ServerStreamingHandler } from './ServerStreamingHandler';
import { BaseEchoTest } from './BaseEchoTest';
import * as plexus from '../../src/echo/gen/plexus-messages';
import { ClientError } from '@plexus-interop/protocol';
import { expect } from 'chai';
import { delayed } from '@plexus-interop/common';

export class ServerStreamingInvocationTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public testServerSendsStreamToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (context, request, hostClient) => {
                try {
                    this.verifyInvocationContext(context);
                    await this.assertEqual(request, echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.complete();
                } catch (error) {
                    reject(error);
                }
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
            const responses: plexus.plexus.interop.testing.IEchoRequest[] = [];

            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: (response) => {
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
                },
                streamCompleted: () => { }
            });
        });
    }

    public testServerSendsStreamWithErrorToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (context, request, hostClient) => {
                try {
                    await this.assertEqual(request, echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.error(new ClientError('Host error', 'Error Details'));
                } catch (error) {
                    reject(error);
                }
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: () => {},
                complete: async () => {
                    reject('Not expected to be completed');
                },
                error: async e => {
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                },
                streamCompleted: () => { }
            });
        });
    }

    public async testClientCanCloseServerStreamingRequest(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();        
        const handler = new ServerStreamingHandler((context, request, hostClient) => {
            hostClient.next(echoRequest);
            // do not send completion, so invocation stays open
        });
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
        debugger;
        const invocationClient = await client.getEchoServiceProxy().serverStreaming(this.clientsSetup.createRequestDto(), {
            next: response => {
                console.log('Next');
            },
            complete: async () => {
                console.log('Completed');
            },
            error: async e => {
                console.log('Error');
            },
            streamCompleted: () => { }
        });
        await delayed(async () => {}, 5000);
        await invocationClient.cancel();
        await delayed(async () => {}, 10000);
        await this.clientsSetup.disconnect(client, server);
    }

    public testServerExceptionReceivedByClient(): Promise<void> {
        const errorText = 'Host error';
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler((context, request, hostClient) => {
                throw new Error(errorText);
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
            client.getEchoServiceProxy().serverStreaming(this.clientsSetup.createRequestDto(), {
                next: response => {
                    reject('Not expected to receive update');
                },
                complete: async () => {
                    reject('Not expected to be completed');
                },
                error: async e => {
                    expect(e.message).to.eq(errorText);
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                },
                streamCompleted: () => { }
            });
        });
    }

    public testServerSendsFewStreamsInParrallelToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (context, request, hostClient) => {
                try {
                    await this.assertEqual(request, echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.complete();
                } catch (error) {
                    reject(error);
                }
            });

            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);

            let firstCompleted = false;
            let secondCompleted = false;

            // first
            const firstResponses: plexus.plexus.interop.testing.IEchoRequest[] = [];
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: response => firstResponses.push(response),
                complete: async () => {
                    firstCompleted = true;
                    expect(firstResponses.length).is.eq(3);
                    firstResponses.forEach(r => this.assertEqual(r, echoRequest));
                    if (secondCompleted) {
                        await this.clientsSetup.disconnect(client, server);
                        resolve();
                    }
                },
                error: e => reject(e),
                streamCompleted: () => { }
            });

            // second
            const secondResponses: plexus.plexus.interop.testing.IEchoRequest[] = [];
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: response => secondResponses.push(response),
                complete: async () => {
                    secondCompleted = true;
                    expect(secondResponses.length).is.eq(3);
                    secondResponses.forEach(r => this.assertEqual(r, echoRequest));
                    if (firstCompleted) {
                        await this.clientsSetup.disconnect(client, server);
                        resolve();
                    }
                },
                error: e => reject(e),
                streamCompleted: () => { }
            });
        });
    }

    public testServerSendsStreamWithCancelToClient(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        return new Promise<void>(async (resolve, reject) => {
            const handler = new ServerStreamingHandler(async (context, request, hostClient) => {
                try {
                    await this.assertEqual(request, echoRequest);
                    await hostClient.cancel();
                } catch (error) {
                    reject(error);
                }
            });
            const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);

            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: response => {
                },
                complete: async () => {
                    reject('Not expected to be completed');
                },
                error: async e => {
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                },
                streamCompleted: () => { }
            });
        });
    }

}