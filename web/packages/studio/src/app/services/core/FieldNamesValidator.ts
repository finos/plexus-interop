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
import { InteropRegistry, Message } from '@plexus-interop/metadata';
import { DefaultMessageGenerator } from './DefaultMessageGenerator';

import { default as Set } from 'typescript-collections/dist/lib/Set';

const maxRecursiveDepth = 3;

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
        Object.getOwnPropertyNames(object).forEach(key => {
            const fullPropertyName = prefix + key;
            result.add(fullPropertyName);
            const value = object[key];
            if (this.messageGenerator.isMapByName(messageId, key)) {
                // map field, stop
                return;
            }
            if (this.isObject(value)) {
                this.collectObjFieldNames(messageId, value, result, fullPropertyName + ".");
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
            return this.collectFields(message);
        }
    }

    private collectFields(
        message: Message,
        collectedFields: Set<string> = new Set(),
        visitedNestedTypes: Map<string, number> = new Map(),
        prefix: string = ""): Set<string> {

        let visitsCount = visitedNestedTypes.get(message.id) || 0;
        if (visitsCount > maxRecursiveDepth) {
            // already visited few times, skip nested fields
            return;
        }
        visitedNestedTypes.set(message.id, visitsCount + 1);
        Object.getOwnPropertyNames(message.fields)
            .map(fieldName => {
                const field = message.fields[fieldName];
                const type = !!field ? this.messageGenerator.lookupMessageByFieldType(message.id, field.type) : undefined;
                return { field, type, fieldName };
            })
            // fields with message type goes at the end, so we have better chances to process
            // simple types before got recursive call issue
            .sort((first, second) => {
                const firstScore = !!first.type ? 1 : 0;
                const secondScore = !!second.type ? 1 : 0;
                return secondScore - firstScore;
            })
            .forEach(field => {
                const fullFieldName = `${prefix}${field.fieldName}`;
                collectedFields.add(fullFieldName);
                if (field.type) {
                    this.collectFields(field.type, collectedFields, visitedNestedTypes, fullFieldName + ".");
                }
            });
        return collectedFields;
    }


}
