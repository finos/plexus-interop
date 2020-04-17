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
import { InteropRegistry } from '@plexus-interop/metadata';
import { ExtendedMarshaller } from '../api/ExtendedMarshaller';
import * as protobuf from 'protobufjs/light';
import { DynamicProtoMarshaller } from './DynamicProtoMarshaller';
import { Root } from 'protobufjs/light';

/**
 * Dynamic Marshaller, based on Interop Metadata Registry
 */
export class DynamicProtoMarshallerFactory {

    // tslint:disable-next-line:typedef
    private readonly cache = new Map<string, ExtendedMarshaller<any, ArrayBuffer>>();

    private readonly protobufRoot: Root;

    public constructor(private readonly registry: InteropRegistry) {
        this.protobufRoot = protobuf.Root.fromJSON(registry.rawMessages);
    }

    public getMarshaller(messageId: string): ExtendedMarshaller<any, ArrayBuffer> {
        if (this.cache.has(messageId)) {
            return this.cache.get(messageId) as ExtendedMarshaller<any, ArrayBuffer>;
        }
        const marshaller = this.createDynamicMarshaller(this.registry, messageId);
        this.cache.set(messageId, marshaller);
        return marshaller;
    }

    private createDynamicMarshaller(registry: InteropRegistry, messageId: string): ExtendedMarshaller<any, ArrayBuffer> {
        const message = registry.messages.get(messageId);
        if (!message) {
            throw new Error(`${messageId} not found in Registry`);
        }
        const type = this.protobufRoot.lookupType(messageId);
        return new DynamicProtoMarshaller(type);
    }

}