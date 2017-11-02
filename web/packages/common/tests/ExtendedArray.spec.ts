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
import { ExtendedArray } from "../src/util/ExtendedArray";
import { expect } from "chai";

describe("ExtededArray", () => {

    it("Returns distinct values by key", () => {
        const result = ExtendedArray.of([{ a: "1", b: "x" }, { a: "1", b: "y" }])
            .distinct(x => x.a)
            .getValues();
        expect(result[0].a).eq("1");
        expect(result.length).eq(1);
    });

    it("Can join with other array", () => {
        const result = ExtendedArray.of([1, 2, 3])
            .joinWith([4, 5, 6], (x, y) => x + y, (x, y) => x === 1 && y === 4)
            .getValues();
        
        expect(result.length).eq(1);
        expect(result[0]).eq(5);
    });

    it("Can be converted to Map", () => {
        const map = ExtendedArray.of([1])
            .toMap(x => x + 1, x => x + 2);
        expect(map.size).eq(1);
        expect(map.get(2)).eq(3);
    });

});