/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import { ExtendedMap } from './collections/ExtendedMap';

export class Arrays {

    public static concatenateBuffers(...buffers: ArrayBuffer[]): ArrayBuffer {
        const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        buffers.forEach(b => {
            result.set(new Uint8Array(b), offset);
            offset += b.byteLength;
        });
        return result.buffer;
    }

    public static toArrayBuffer(typedArray: Uint8Array): ArrayBuffer {
        return new Uint8Array(typedArray).buffer;
    }

}

export function arrayBufferToString(buf: ArrayBuffer): string {
    let binaryString = '';
    let bytes = new Uint8Array(buf);
    const length = bytes.length;
    for (let i = 0; i < length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }
    return binaryString;
}

export function stringToArrayBuffer(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

export function concat<T>(x: T[], y: T[]): T[] {
    return x.concat(y);
}

export function flatMap<T, R>(f: (el: T) => R[], array: T[]): R[] {
    return array.map(f).reduce<R[]>(concat, []);
}

export function join<T, R, Y>(first: T[], second: R[], joinFn: (x: T, y: R) => Y, predicate: (x: T, y: R) => boolean = () => true): Y[] {
    const result: Y[] = [];
    first.forEach(x => second.forEach(y => {
        if (predicate(x, y)) {
            result.push(joinFn(x, y));
        }
    }));
    return result;
}

export function distinct<T>(array: T[], key: (x: T) => any): T[] {
    const seen = new Set();
    return array.filter(item => {
        const k = key(item);
        return seen.has(k) ? false : seen.add(k);
    });
}

export function toMap<T, K, V>(array: T[], keyFn: (v: T) => K, vFn: (v: T) => V): ExtendedMap<K, V> {
    const result = ExtendedMap.create<K, V>();
    array.forEach(v => result.set(keyFn(v), vFn(v)));
    return result;
}