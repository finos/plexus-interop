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
import { InteropRegistryService, Enum, Message } from '@plexus-interop/broker';

export class DefaultMessageGenerator {

    public constructor(private readonly interopRegistryService: InteropRegistryService) { }

    // https://developers.google.com/protocol-buffers/docs/reference/proto3-spec    
    private readonly primitiveTypes = [
        'double', 'float', 'int32', 'int64', 'uint32',
        'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64',
        'sfixed32', 'sfixed64', 'bool', 'string'];

    public generate(messageId: string): string {
        return JSON.stringify(this.generateObj(messageId));
    }

    private generateObj(messageId: string, skipMessageType: boolean = false): any {
        const message = this.lookupMessage(messageId);
        if (!message) {
            throw new Error(`${messageId} is not found`);
        }
        const defaultPayload: any = {};
        for (let fieldName in message.fields) {
            const field = message.fields[fieldName];
            if (field.keyType) {
                // primitive 'map' support
                defaultPayload[fieldName] = {};
            } else if (field.rule && field.rule === 'repeated') {
                defaultPayload[fieldName] = [];
            } else if (this.isPrimitive(field.type)) {
                switch (field.type) {
                    case 'string':
                        defaultPayload[fieldName] = 'stringValue';
                        break;
                    case 'bool':
                        defaultPayload[fieldName] = false;
                        break;
                    default:
                        defaultPayload[fieldName] = 0;
                }
            } else {
                const enumRef = this.lookupEnum(field.type) 
                    || this.lookupEnum(`${messageId}.${field.type}`) 
                    || this.lookupEnum(`${this.getNamespace(messageId)}.${field.type}`)
                if (enumRef) {
                    defaultPayload[fieldName] = this.anyValue(enumRef.values);
                } else if (skipMessageType) {
                    defaultPayload[fieldName] = [];
                } else {
                    const subMessage = this.lookupMessage(field.type) 
                        || this.lookupMessage(`${messageId}.${field.type}`) 
                        || this.lookupMessage(`${this.getNamespace(messageId)}.${field.type}`);
                    if (subMessage) {
                        defaultPayload[fieldName] = this.generateObj(subMessage.id, true);
                    }
                }
            }
        }
        return defaultPayload;
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
        const enums = this.interopRegistryService.getRegistry().enums;
        if (enums) {
            return enums.get(id);
        }
        return null;
    }

    private lookupMessage(id: string): Message | null {
        return this.interopRegistryService.getRegistry().messages.get(id);
    }

    private isPrimitive(type: string): boolean {
        return this.primitiveTypes.indexOf(type) !== -1;
    }

}