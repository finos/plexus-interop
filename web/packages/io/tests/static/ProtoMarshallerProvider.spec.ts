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
import { ProtoMarshallerProvider } from '../../src/static/ProtoMarshallerProvider';
import { clientProtocol as plexus } from '@plexus-interop/protocol';

describe('Proto Marshaller Provider', () => {

    const sut = new ProtoMarshallerProvider();

    it('Provides Marshaller by Message Type', () => {
        const marshaller = sut.getMarshaller(plexus.interop.protocol.ConnectRequest);
        expect(marshaller).toBeDefined();
    });

    it('Decodes valid message', () => {
        const marshaller = sut.getMarshaller(plexus.interop.protocol.ConnectRequest);

        const encoded = marshaller.encode({
            applicationId: 'ID'
        });
        const decoded = marshaller.decode(encoded);
        expect(decoded.applicationId).toEqual('ID');
    });

    it('Decodes undefined to default', () => {
        const marshaller = sut.getMarshaller(plexus.interop.protocol.ConnectRequest);

        const encoded = marshaller.encode({});
        const decoded = marshaller.decode(encoded);
        expect(decoded.applicationId).toBe("");
    });
});