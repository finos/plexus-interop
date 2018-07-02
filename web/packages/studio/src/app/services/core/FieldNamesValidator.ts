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
import { InteropRegistry, Message } from '@plexus-interop/broker';
import { DefaultMessageGenerator } from './DefaultMessageGenerator';

import { Set } from 'typescript-collections';

export class FieldNamesValidator {

    private messageGenerator: DefaultMessageGenerator;

    private messageFieldsNameCache = new Map<string, Set<string>>();

    public constructor(private readonly registryProvider: { getRegistry: () => InteropRegistry }) {
        this.messageGenerator = new DefaultMessageGenerator(registryProvider);
    }

    public validate(messageId: string, payload: any): void {
        const message = this.registryProvider.getRegistry().messages.get(messageId);
        const existingFieldNames = this.collectFieldNames(message);
        const actualFieldNames = this.collectObjFieldNames(messageId, payload);
        actualFieldNames.difference(existingFieldNames);
        if (!actualFieldNames.isEmpty()) {
            throw `[${actualFieldNames.toArray().join(",")}] field(s) do not exist`;
        }
    }

    public collectObjFieldNames(messageId: string, object: any, result: Set<string> = new Set<string>(), prefix: string = ""): Set<string> {
        if (Array.isArray(object) || !object) {
            return result;
        }
        Object.keys(object).forEach(key => {
            if (object.hasOwnProperty(key)) {
                result.add(prefix + key);
                const value = object[key];
                if (this.messageGenerator.isMapByName(messageId, key)) {
                    // map field, stop
                    return;
                }
                if (this.isObject(value)) {
                    this.collectObjFieldNames(messageId, value, result, key + ".");
                }
            }
        });
        return result;
    }

    private isObject(obj) {
        return obj !== null && typeof obj === 'object';
    }

    private collectFieldNames(message: Message): Set<string> {
        if (this.messageFieldsNameCache.has(message.id)) {
            return this.messageFieldsNameCache.get(message.id);
        } else {
            return this.collectFields(message, new Set<string>());
        }
    }

    private collectFields(message: Message, result: Set<string>, prefix: string = ""): Set<string> {
        for (let fieldName in message.fields) {
            result.add(prefix + fieldName);
            const field = message.fields[fieldName];
            const messageType = this.messageGenerator.lookupMessageByFieldType(message.id, field.type);
            if (messageType) {
                this.collectFields(messageType, result, fieldName + ".");
            }
        }
        return result;
    }

    private lookupMessage(id: string): Message | null {
        return this.registryProvider.getRegistry().messages.get(id);
    }

}