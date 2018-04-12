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
import { join, distinct, toMap, concat } from './Arrays';
import { ExtendedMap } from './collections/ExtendedMap';

/**
 * Provides few additional utility methods for array modification, immutable, all operations create new instance
 */
export class ExtendedArray<T> {

    constructor(private readonly values: T[]) {}

    public static of<T>(values: T[]): ExtendedArray<T> {
        return new ExtendedArray<T>(values);
    }

    public joinWith<R, Y>(second: R[], joinFn: (x: T, y: R) => Y, predicate: (x: T, y: R) => boolean = () => true): ExtendedArray<Y> {
        return ExtendedArray.of<Y>(join(this.values, second, joinFn, predicate));
    }

    public distinct(key: (x: T) => any = x => x ): ExtendedArray<T> {
        return ExtendedArray.of(distinct(this.values, key));
    }

    public toArray(): T[] {
        return this.values;
    }

    public flatMap<R>(f: (el: T) => R[]): ExtendedArray<R> {
        return ExtendedArray.of(this.values.map(f).reduce<R[]>(concat, []));
    }

    public toMap<K, V>(keyFn: (v: T) => K, vFn: (v: T) => V): ExtendedMap<K, V> {
        return toMap(this.values, keyFn, vFn);
    }

}