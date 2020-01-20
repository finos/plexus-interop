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
import { BinaryMarshaller, Marshaller } from '../api';
import { DynamicProtoMarshaller } from './DynamicProtoMarshaller';

export class DynamicBinaryProtoMarshaller implements BinaryMarshaller {
    
    public constructor(private readonly internal: Marshaller<any, ArrayBuffer>) {}
    
    public encode(messageObj: any): Uint8Array {
        return new Uint8Array(this.internal.encode(messageObj));
    }
    
    public decode(messagePayload: Uint8Array): any {
        return this.internal.decode(messagePayload.buffer);
    }
}