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
import { ClientsSetup } from '../common/ClientsSetup';
import { TransportsSetup } from '../common/TransportsSetup';
import { readWsUrl } from '../common/utils';
import { PointToPointInvocationTests } from '../echo/PointToPointInvocationTests';
import { UnaryServiceHandler } from '../echo/UnaryServiceHandler';
import { MethodInvocationContext } from '@plexus-interop/client-api';
import { InvocationRequestInfo } from '@plexus-interop/client';
import { BaseEchoTest } from '../echo/BaseEchoTest';
import { UrlInteropRegistryProvider } from '@plexus-interop/metadata';
import { DynamicBinaryMarshallerProvider } from '@plexus-interop/io/dist/main/src/dynamic';

describe('Client: Web Socket Send Plain JS Object', () => {

    const clientsSetup = new ClientsSetup();
    const transportsSetup = new TransportsSetup();

    const wsUrl = readWsUrl();    
    const connectionProvider = transportsSetup.createWebSocketTransportProvider(wsUrl);
    const testUtils = new BaseEchoTest();

    it('Sends invocation request and receives response', async () => {
        const echoRequest = clientsSetup.createRequestDto();

        const interopProvider = new UrlInteropRegistryProvider(wsUrl);
        await interopProvider.start();
        const marshallerProvider = new DynamicBinaryMarshallerProvider(interopProvider.getCurrent());

        return new Promise<void>((resolve, reject) => {
            const handler = new UnaryServiceHandler(async (context: MethodInvocationContext, request) => {
                try {
                    testUtils.assertEqual(request, echoRequest);
                } catch (error) {
                    reject(error);
                }
                return request;
            });
            clientsSetup.createGenericClientAndStaticServer(marshallerProvider, connectionProvider, handler)
                .then(clients => {
                    const genericClient = clients[0];
                    const invocationInfo: InvocationRequestInfo = {
                        methodId: 'Unary',
                        serviceId: 'plexus.interop.testing.EchoService'
                    };
                    genericClient.sendUnaryRequest(invocationInfo, echoRequest, {
                        value: echoResponse => {
                            testUtils.assertEqual(echoRequest, echoResponse);
                            genericClient.disconnect()
                                .then(() => clients[1].disconnect())
                                .then(() => resolve());
                        },
                        error: e => reject(e)
                    }, 'plexus.interop.testing.EchoRequest', 'plexus.interop.testing.EchoRequest');
                })
                .catch(error => reject(error));
        });
    });

});