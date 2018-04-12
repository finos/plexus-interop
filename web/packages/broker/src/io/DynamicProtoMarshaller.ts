/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { Marshaller } from './Marshaller';
import * as protobuf from 'protobufjs/light';
import { Arrays } from '@plexus-interop/common';

export class DynamicProtoMarshaller implements Marshaller<any, ArrayBuffer> {

    public constructor(private readonly protoType: protobuf.Type) { }

    public validate(messageObj: any): void {
        const error = this.protoType.verify(messageObj);
        if (error) {
            throw new Error(error);
        }
    }

    public decode(messagePayload: ArrayBuffer): any {
        const decoded = this.protoType.decode(new Uint8Array(messagePayload));
        return this.protoType.toObject(decoded);
    }

    public encode(messageObj: any): ArrayBuffer {
        return Arrays.toArrayBuffer(this.protoType.encode(messageObj).finish());
    }
}