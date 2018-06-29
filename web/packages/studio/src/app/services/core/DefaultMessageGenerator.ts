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
import { InteropRegistryService, Enum, Message, InteropRegistry } from '@plexus-interop/broker';

export class DefaultMessageGenerator {

    public constructor(private readonly interopRegistryProvider: { getRegistry: () => InteropRegistry }) { }

    // https://developers.google.com/protocol-buffers/docs/reference/proto3-spec    
    private readonly primitiveTypes = [
        'double', 'float', 'int32', 'int64', 'uint32',
        'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64',
        'sfixed32', 'sfixed64', 'bool', 'string'];

    public generate(messageId: string): string {
        return JSON.stringify(this.generateObj(messageId));
    }

    public generateObj(messageId: string, skipMessageType: boolean = false): any {
        const message = this.lookupMessage(messageId);
        if (!message) {
            throw new Error(`${messageId} is not found`);
        }
        const defaultPayload: any = {};
        for (let fieldName in message.fields) {
            const field = message.fields[fieldName];
            defaultPayload[fieldName] = this.isArray(field) ?
                this.generateArrayValue(messageId, field, skipMessageType)
                : this.generateNonArrayValue(messageId, field, skipMessageType)
        }
        return defaultPayload;
    }

    private generateArrayValue(messageId: string, field: any, skipMessageType: boolean): any {
        return [this.generateNonArrayValue(messageId, field, skipMessageType)];
    }

    private generateNonArrayValue(messageId: string, field: any, skipMessageType: boolean): any {
        if (field.keyType) {
            // map
            return {};
        } else if (this.isPrimitive(field.type)) {
            // primitive
            return this.getPrimitiveDefault(field.type);
        } else {
            // enum or message
            const enumRef = this.lookupEnum(field.type)
                || this.lookupEnum(`${messageId}.${field.type}`)
                || this.lookupEnum(`${this.getNamespace(messageId)}.${field.type}`)
            if (enumRef) {
                return this.anyValue(enumRef.values);
            } else if (skipMessageType) {
                return {};
            } else {
                const messageType = this.lookupMessageByFieldType(messageId, field.type);
                if (messageType) {
                    return this.generateObj(messageType.id, true);
                } else {
                    return {};
                }
            }
        }
    }

    public lookupMessageByFieldType(messageId: string, fieldType: string): Message | null {
        return this.lookupMessage(fieldType)
            || this.lookupMessage(`${messageId}.${fieldType}`)
            || this.lookupMessage(`${this.getNamespace(messageId)}.${fieldType}`)
    }

    public isArray(field: any): boolean {
        return field.rule && field.rule === 'repeated';
    }

    private getPrimitiveDefault(type: string): any {
        switch (type) {
            case 'string':
                return 'stringValue';
            case 'bool':
                return false;
            default:
                return 0;
        }
    }

    private anyValue(o: any): any {
        for (let k in o) {
            return o[k];
        }
        return null;
    }

    private getNamespace(id: string): string {
        const parts = id.split('.');
        if (parts.length > 1) {
            return parts.slice(0, parts.length - 1).join('.');
        } else {
            return id;
        }
    }

    private lookupEnum(id: string): Enum | null {
        const enums = this.interopRegistryProvider.getRegistry().enums;
        if (enums) {
            return enums.get(id);
        }
        return null;
    }

    private lookupMessage(id: string): Message | null {
        return this.interopRegistryProvider.getRegistry().messages.get(id);
    }

    public isPrimitive(type: string): boolean {
        return this.primitiveTypes.indexOf(type) !== -1;
    }

}