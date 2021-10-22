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
import { UniqueId } from '../../src/dto/UniqueId';

describe('UniqueId', () => {
    it('Converts guid to string and back', () => {
        const id = UniqueId.generateNew();
        const strId = id.toString();
        expect(UniqueId.fromString(strId).toString()).toBe(strId);
    });
    it('Converts id to 32 lengh string', () => {
        const id = UniqueId.generateNew();
        const strId = id.toString();
        expect(id.toString().length).toBe(32);
    });
    it('fromString and toString compatible for small numbers', () => {
        const s = "00000000000000000000000000000001";
        const id = UniqueId.fromString(s);
        const strId = id.toString();
        expect(strId).toBe(s);
    });
});