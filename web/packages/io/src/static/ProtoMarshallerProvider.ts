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
import { getPlexusFeatures } from '@plexus-interop/common';
import { BinaryMarshallerProvider } from '../api/BinaryMarshallerProvider';
import { BinaryMarshaller } from '../api/BinaryMarshaller';

/**
 * Provides Marshaller based on generated Protobuf message types
 */
export class ProtoMarshallerProvider implements BinaryMarshallerProvider {

    public getMarshaller(messageObj: any): BinaryMarshaller {
        if (!messageObj) {
            throw new Error('Proto message definition is not provided');
        } else if (!messageObj.encode || !messageObj.decode) {
            throw new Error('Encode/Decode is missed for message definition');
        } else {
            return {
                encode: (obj: any): Uint8Array => {
                    return messageObj.encode(obj).finish() as Uint8Array;
                },
                decode: (payload: Uint8Array): any => {
                    const features = getPlexusFeatures();
                    return messageObj.toObject(messageObj.decode(payload), { defaults: features.decodeUndefinedToDefault });
                }
            };
        }
    }
}