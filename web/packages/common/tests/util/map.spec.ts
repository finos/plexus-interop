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
import { pop } from '../../src/util/collections/map';

describe('Map Utils', () => {

    it('Should pop last element from Map', () => {

        const map = new Map();

        map.set(1, 2);
        map.set(3, 4);

        const [key, value] = pop(map);

        expect(key).toBe(3);
        expect(value).toBe(4);
        expect(map.get(key)).toBeUndefined();

    });

});