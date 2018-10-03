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
import { InteropRegistry } from '@plexus-interop/metadata';
import { ExtendedMap } from '@plexus-interop/common';
import { Application } from '@plexus-interop/metadata';
import { Message } from '@plexus-interop/metadata';
import { Service } from '@plexus-interop/metadata';
import { DynamicMarshallerFactory } from '../../src/io/DynamicMarshallerFactory';
import * as fs from 'fs';
import { JsonInteropRegistryProvider } from '@plexus-interop/metadata';

describe('DynamicMarshallerFactory', () => {

    const metadataJson = fs.readFileSync('../metadata/tests/json/test-interop.json', 'utf8');    
    const registry = new JsonInteropRegistryProvider(metadataJson).getCurrent();

    const messages = ExtendedMap.create<string, Message>();
    const messageId = 'plexus.interop.testing.EchoRequest';

    const validMessage = {
        stringField: 'stringData',
        boolField: true,
        enumField: 1,
        repeatedDoubleField: [1, 2, 3],
        subMessageField: {
            stringField: 'stringData'
        }
    };  

    const invalidTypeMessage = {
        stringField: 'stringData',
        boolField: 'true'
    };    

    const invalidEnumValueMessage = {
        stringField: 'stringData',
        enumField: 10
    };    

    const sut = new DynamicMarshallerFactory(registry);

    it('Creates Marshaller for existing Message', () => {
        const marshaller = sut.getMarshaller(messageId);
        expect(marshaller).toBeDefined();
    });

    it('Reuse same Marshaller for next calls', () => {
        expect(sut.getMarshaller(messageId))
            .toBe(sut.getMarshaller(messageId));
    });

    it('It creates Marshaller with validation support', () => {
        const marshaller = sut.getMarshaller(messageId);
        marshaller.validate(validMessage);        
    });

    it('Raises an Error for Marshaller request on not existing Message', () => {
        try {
            sut.getMarshaller('Do not exist');
            fail('Should fail');
        } catch (error) {  
        }
    });

    it('Creates Marshaller which fail on messages with wrong type', () => {
        const marshaller = sut.getMarshaller(messageId);
        expect(() => marshaller.validate(invalidTypeMessage)).toThrowError();
    });

    it('Creates Marshaller which fail on messages with wrong enum value', () => {
        const marshaller = sut.getMarshaller(messageId);
        expect(() => marshaller.validate(invalidEnumValueMessage)).toThrowError();
    });

    it('Creates Marshaller encoding/decoding support', () => {
        const marshaller = sut.getMarshaller(messageId);  
        const encoded = marshaller.encode(validMessage);
        expect(encoded).toBeDefined();
        const decoded = marshaller.decode(encoded);
        expect(decoded).toEqual(validMessage);
    });

});