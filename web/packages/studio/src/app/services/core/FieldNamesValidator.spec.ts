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
import { InteropRegistryService, Message, InteropRegistry, Service, Application, Enum } from '@plexus-interop/metadata';
import { ExtendedMap } from '@plexus-interop/common';
import { FieldNamesValidator } from './FieldNamesValidator';

describe('Field names validator', () => {

    const fieldMessageId = "field.message.id";
    const fieldMessage: Message = {
        id: fieldMessageId,
        fields: {
            stringField: {
                type: "string",
                id: 1
            }
        }
    };
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
            stringArrayField: {
                type: 'string',
                rule: 'repeated',
                id: 2
            },
            boolField: {
                type: 'bool',
                id: 3
            },
            messageField: {
                type: fieldMessageId,
                id: 4
            },
            mapField: {
                keyType: "string",
                type: "string",
                id: 5
            }
        }
    };

    it('Should pass object with correct fields', () => {
        new FieldNamesValidator(setupRegistry([fieldMessage, message])).validate(id, {
            int32Field: 0,
            stringField: "123",
            stringArrayField: ["123"],
            messageField: {
                stringField: "1234"
            }
        });
    });

    it('Should fail on object with incorrect field', () => {
        try {
            new FieldNamesValidator(setupRegistry([fieldMessage, message])).validate(id, {
                int32Field_x: 0
            });
            fail('Expected to fail');    
        } catch (error) {
        }        
    });

    it('Should fail on object with incorrect nested field', () => {
        try {
            new FieldNamesValidator(setupRegistry([fieldMessage, message])).validate(id, {
                messageField: {
                    stringField_x: "1234"
                }
            });
            fail('Expected to fail');    
        } catch (error) {
        }        
    });

    it('Should pass object with Map field', () => {
        new FieldNamesValidator(setupRegistry([fieldMessage, message])).validate(id, {
            mapField: {
                someKey: "1234"
            }
        });      
    });

});

function setupRegistry(messages: Message[]): { getRegistry: () => InteropRegistry } {

    const messagesMap = ExtendedMap.create<string, Message>();
    messages.forEach(m => messagesMap.set(m.id, m));

    const registry = {
        messages: messagesMap,
        applications: ExtendedMap.create<string, Application>(),
        services: ExtendedMap.create<string, Service>(),
        rawMessages: {}
    };

    return {
        getRegistry: () => registry
    };
}