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
import { readWsUrl } from '../common/utils';
import { InteropPlatformFactory, InteropPlatform, MethodImplementation, InteropPeerDescriptor } from '@plexus-interop/common-api-impl';
import { expect } from 'chai';
import { BaseEchoTest } from '../echo/BaseEchoTest';
import { ClientsSetup } from '../common/ClientsSetup';

// tslint:disable:no-unused-expression
describe('Client: Common API Implementation', () => {

    const webSocketUrl = readWsUrl();

    const factory = new InteropPlatformFactory();

    const clientsSetup = new ClientsSetup();
    const testUtils = new BaseEchoTest();

    it('Creates Interop Platform Factory', async () => {

        const platform = await factory.createPlatform({ webSocketUrl });
        expect(platform).to.not.be.undefined;

    });

    it('Connects to Broker', async () => {

        const platform: InteropPlatform = await factory.createPlatform({ webSocketUrl });
        const client = await platform.connect('echo-client');
        expect(client).to.not.be.undefined;
        await client.disconnect();

    });

    it('Sends request and receives response', async () => {

        const platform: InteropPlatform = await factory.createPlatform({ webSocketUrl });
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
        testUtils.assertEqual(request, response);
        expect(client).to.not.be.undefined;
        expect(server).to.not.be.undefined;

        await client.disconnect();
        await server.disconnect();

    });

});