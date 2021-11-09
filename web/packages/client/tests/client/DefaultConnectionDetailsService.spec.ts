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
import { ConnectionDetails } from '../../src/client/api/container/ConnectionDetails';
import { WsConnectionProtocol } from '../../src/client/api/container/WsConnectionProtocol';
import { DefaultConnectionDetailsService } from '../../src/client/api/container/DefaultConnectionDetailsService';

describe('DefaultConnectionDetailsService', () => {

    it('getConnectionDetails returns correct result', async (done) => {
        const service = new DefaultConnectionDetailsService(getConnectionDetailsFactory(WsConnectionProtocol.Wss));
        service.getConnectionDetails().then(r => {
            expect(r.ws.protocol).toBe('wss');
            expect(r.ws.port).toBe(42);
            expect(r.appInstanceId).toBe('007');
            done();
        });
    });

    it('getConnectionDetails returns default ws protocol if not defined', async (done) => {
        const service = new DefaultConnectionDetailsService(getConnectionDetailsFactory());
        service.getConnectionDetails().then(r => {
            expect(r.ws.protocol).toBe('ws');
            done();
        });
    });

    it('getMetadataUrl returns correct result', async (done) => {
        const service = new DefaultConnectionDetailsService(getConnectionDetailsFactory(WsConnectionProtocol.Wss));
        service.getMetadataUrl().then(r => {
            expect(r).toBe('wss://127.0.0.1:42/metadata/interop');
            done();
        });
    });

    function getConnectionDetailsFactory(protocol?: WsConnectionProtocol): () => Promise<ConnectionDetails> {
        return () => Promise.resolve<ConnectionDetails>({
            ws: {
                protocol: protocol,
                port: 42
            },
            appInstanceId: '007'
        });
    }
});
