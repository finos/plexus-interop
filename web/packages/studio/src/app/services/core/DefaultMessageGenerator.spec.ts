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
import { InteropRegistryService, Message, InteropRegistry, Service, Application, Enum } from '@plexus-interop/broker';
import { ExtendedMap } from '@plexus-interop/common';
import { DefaultMessageGenerator } from './DefaultMessageGenerator';

describe('DefaultMessageGenerator', () => {

    it('Should generate object for primitive types', () => {
        const id = 'test';
        const message: Message = {
            id,
            fields: {
                int32Field: {
                    type: 'int32',
                    id: 1
                },
                stringField: {
                    type: 'string',
                    id: 2
                },
                boolField: {
                    type: 'bool',
                    id: 3
                } 
            }
        };
        const generated = new DefaultMessageGenerator(setupRegistry([message])).generateObj(id);
        expect(generated.stringField).toBe('stringValue');
        expect(generated.int32Field).toBe(0);
        expect(generated.boolField).toBe(false);
    });

    it('Should generate object with enum field', () => {
        const messageId = 'test';
        const enumId = 'test.enum';
        const testEnum: Enum = {
            id: enumId,
            values: {
                "ONE": 1
            }
        };
        const message: Message = {
            id: messageId,
            fields: {
                enumField: {
                    type: enumId,
                    id: 1
                }
            }
        };
        const generated = new DefaultMessageGenerator(setupRegistry([message], [testEnum])).generateObj(messageId);
        expect(generated.enumField).toBe(1);
    });

});

function setupRegistry(messages: Message[], enums: Enum[] = []): { getRegistry: () => InteropRegistry } {
    
    const messagesMap = ExtendedMap.create<string, Message>();    
    messages.forEach(m => messagesMap.set(m.id, m));

    const enumsMap = ExtendedMap.create<string, Enum>();
    enums.forEach(e => enumsMap.set(e.id, e));

    const registry = {
        messages: messagesMap,
        enums: enumsMap,
        applications: ExtendedMap.create<string, Application>(),
        services: ExtendedMap.create<string, Service>(),
        rawMessages: {}
    };

    return {
        getRegistry: () => registry
    };
}
