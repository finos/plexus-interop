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
import { InteropRegistry } from "../metadata";
import { Marshaller } from "./Marshaller";
import * as protobuf from "protobufjs/light";
import { DynamicProtoMarshaller } from "./DynamicProtoMarshaller";

export class DynamicMarshallerFactory {

    // tslint:disable-next-line:typedef
    private readonly cache = new Map<string, Marshaller<any, ArrayBuffer>>();

    public constructor(private readonly registry: InteropRegistry) { }

    public getMarshaller(messageId: string): Marshaller<any, ArrayBuffer> {
        if (this.cache.has(messageId)) {
            return this.cache.get(messageId) as Marshaller<any, ArrayBuffer>;
        }
        const marshaller = this.createDynamicMarshaller(this.registry, messageId);
        this.cache.set(messageId, marshaller);
        return marshaller;
    }

    private createDynamicMarshaller(registry: InteropRegistry, messageId: string): Marshaller<any, ArrayBuffer> {
        
        // tslint:disable-next-line:variable-name        
        const Type = protobuf.Type;
        // tslint:disable-next-line:variable-name
        const ProtoField = protobuf.Field;

        const message = registry.messages.get(messageId);

        if (!message) {
            throw new Error(`${messageId} not found in Registry`);
        }

        const type = new Type(message.id);

        message.fields
            .filter(f => f.primitive)
            .map(f => new ProtoField(f.name, f.num, f.type))
            .forEach(pf => type.add(pf));

        return new DynamicProtoMarshaller(type);
    }

}