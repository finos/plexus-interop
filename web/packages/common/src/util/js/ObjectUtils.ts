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
export class ObjectUtils {

    public static setPrototypeOf: (object: any, prototype: any) => any = setProtoImpl();

}

function setProtoImpl(): (x: any, y: any) => any {
    return Object.setPrototypeOf || _proto_supported() ? set_proto_ : copyProperties;
}

function set_proto_(obj: any, proto: any): any {
    obj.__proto__ = proto;
    return obj;
}

function _proto_supported(): boolean {
    return { __proto__: [] } instanceof Array;
}

function copyProperties(obj: any, proto: any): any {
    for (let prop in proto) {
        if (!obj.hasOwnProperty(prop)) {
            obj[prop] = proto[prop];
        }
    }
    return obj;
}
