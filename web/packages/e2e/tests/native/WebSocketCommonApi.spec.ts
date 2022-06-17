/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { readWsUrl } from '../common/utils';
import { InteropPlatformFactory, MethodImplementation, InteropPeerDescriptor, Stream, StreamImplementation, StreamObserver, InteropPlatform } from '@plexus-interop/common-api-impl';
import { expect } from 'chai';
import { BaseEchoTest } from '../echo/BaseEchoTest';
import { ClientsSetup } from '../common/ClientsSetup';
import * as plexus from '../../src/echo/server/plexus-messages';
import { AsyncHelper } from '@plexus-interop/common';

// tslint:disable:no-unused-expression
describe('Client: Common API Implementation', () => {

    const webSocketUrl = readWsUrl();

    const factory = new InteropPlatformFactory();

    const clientsSetup = new ClientsSetup();
    const testUtils = new BaseEchoTest();

    it('Creates Interop Platform Factory', async () => {

        const platform = factory.createPlatform({ webSocketUrl });
        expect(platform).to.not.be.undefined;

    });

    it('Connects to Broker', async () => {

        const platform: InteropPlatform = factory.createPlatform({ webSocketUrl });
        const client = await platform.connect('echo-client');
        expect(client).to.not.be.undefined;
        await client.disconnect();

    });

    it('Subscribes to stream and receives data from provider', async () => {
        const platform: InteropPlatform = factory.createPlatform({ webSocketUrl });
        const stream: StreamImplementation = {
            name: 'server-stream',
            onSubscriptionRequested: async (streamObserver: StreamObserver, caller: InteropPeerDescriptor, args?: any) => {
                streamObserver.next(args);
                streamObserver.next(args);
                streamObserver.next(args);
                streamObserver.completed();
                return {
                    unsubscribe: async () => { }
                };
            }
        };

        const client = await platform.connect('echo-client');
        const server = await platform.connect('echo-server', undefined, [], [stream]);
        const request = clientsSetup.createRequestDto();
        const received: any[] = [];

        let completed = false;
        await client.subscribe('server-stream', {
            next: async v => { received.push(v); },
            error: async e => { },
            completed: async () => {
                completed = true;
            }
        }, request);

        await AsyncHelper.waitFor(() => completed, undefined, 50, 2000);
        expect(received.length).to.be.eq(3);

        for (let response of received) {
            testUtils.assertEqual(request, response as plexus.plexus.interop.testing.IEchoRequest);
        }

        await client.disconnect();
        await server.disconnect();
    });

    it('Returns all peer descriptors', async () => {
        const platform: InteropPlatform = factory.createPlatform({ webSocketUrl });
        const definitions = await platform.getPeerDefinitions();
        // tslint:disable-next-line:no-console
        const names = definitions.map(d => d.applicationName);
        expect(names).to.have.members(['echo-server', 'echo-client']);
    });

    it('Discovers streams', async () => {

        const platform: InteropPlatform = factory.createPlatform({ webSocketUrl });
        const stream: StreamImplementation = {
            name: 'server-stream',
            onSubscriptionRequested: async (streamObserver: StreamObserver, caller: InteropPeerDescriptor, args?: any) => {
                streamObserver.completed();
                return {
                    unsubscribe: async () => { }
                };
            }
        };

        const client = await platform.connect('echo-client');
        const server = await platform.connect('echo-server', undefined, [], [stream]);
        const streams = await client.discoverStreams();

        await client.disconnect();
        await server.disconnect();

        expect(streams.length).to.be.greaterThan(0);

    });

    it('Discovers methods', async () => {

        const platform: InteropPlatform = factory.createPlatform({ webSocketUrl });
        const client = await platform.connect('echo-client');
        const method: MethodImplementation = {
            name: 'unary-method',
            onInvoke: async (args: any, caller: InteropPeerDescriptor) => args
        };
        const server = await platform.connect('echo-server', undefined, [method]);
        const methods = await client.discoverMethods();

        await client.disconnect();
        await server.disconnect();

        expect(methods.length).to.be.greaterThan(0);

    });


    it('Sends request and receives response', async () => {

        const platform: InteropPlatform = factory.createPlatform({ webSocketUrl });
        let invoked = false;
        const method: MethodImplementation = {
            name: 'unary-method',
            onInvoke: async (args: any, caller: InteropPeerDescriptor) => {
                invoked = true;
                return args;
            }
        };

        const client = await platform.connect('echo-client');
        const server = await platform.connect('echo-server', undefined, [method]);
        const request = clientsSetup.createRequestDto();
        const response = await client.invoke('unary-method', request);

        expect(invoked).to.be.true;
        expect(response).to.not.be.undefined;
        testUtils.assertEqual(request, response.result as plexus.plexus.interop.testing.IEchoRequest);
        expect(client).to.not.be.undefined;
        expect(server).to.not.be.undefined;

        await client.disconnect();
        await server.disconnect();

    });

});