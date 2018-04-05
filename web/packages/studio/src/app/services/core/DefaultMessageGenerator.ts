/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { InteropRegistryService } from "@plexus-interop/broker";

export class DefaultMessageGenerator {

    public constructor(private readonly interopRegistryService: InteropRegistryService) { }

    private readonly primitiveTypes = [
        "double", "float", "int32", "int64", "uint32",
        "uint64", "sint32", "sint64", "fixed32", "fixed64",
        "sfixed32", "sfixed64", "bool", "string"];

    public generate(messageId: string): string {
        // https://developers.google.com/protocol-buffers/docs/reference/proto3-spec
        const message = this.interopRegistryService.getRegistry().messages.get(messageId);
        if (!message) {
            throw new Error(`${messageId} is not found`);
        }
        const defaultPayload: any = {};
        for (let fieldName in message.fields) {
            const field = message.fields[fieldName];
            if (field.rule && field.rule === "repeated") {
                defaultPayload[fieldName] = [];
            } else if (this.isPrimitive(field.type)) {
                switch (field.type) {
                    case "string":
                        defaultPayload[fieldName] = "stringValue";
                        break;
                    case "bool":
                        defaultPayload[fieldName] = false;
                        break;
                    default:
                        defaultPayload[fieldName] = 0;
                }
            } else {
                // message or enum not supported yet
            }
        }
        return JSON.stringify(defaultPayload);
    }

    private isPrimitive(type: string): boolean {
        return this.primitiveTypes.indexOf(type) !== -1;
    }

}