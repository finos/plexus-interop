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
import { InMemoryCache } from "../../src/cache/InMemoryCache";
import { CacheEntry } from "../../src/cache/CacheEntry";
import { expect } from "chai";

describe("InMemoryCache", () => {
    
    const key = "key";
    const value = {
        x: 10
    };

    it("It can store element without expiration", (done) => {
        const sut = new InMemoryCache();
        sut.set(key, new CacheEntry(value));
        setTimeout(() => {
            expect(sut.get(key)).to.deep.eq(value);
            done();
        }, 50);
    });

    it("I evicts value on expiration time", (done) => {
        const sut = new InMemoryCache();
        sut.set(key, new CacheEntry(value, 5));
        setTimeout(() => {
            expect(sut.get(key)).to.be.undefined;
            done();
        }, 100);
    });

    it("I calls dispose callback on value evition value on expiration time", (done) => {
        const sut = new InMemoryCache();
        sut.set(key, new CacheEntry(value, 5, () => {
            done();
        }));
    });

    it("It returns all not expired keys", () => {

        const sut = new InMemoryCache();
        const keys = ["k", "k2"];

        keys.forEach(k => sut.set(k, new CacheEntry(value)))
        
        const receivedKeys = sut.keys();
        
        expect(receivedKeys.length).to.eq(2);
        expect(receivedKeys.indexOf("k") > -1).to.be.true;
        expect(receivedKeys.indexOf("k2") > -1).to.be.true;

    });

    it("It can restart eviction timer with ttl reset", (done) => {
        const sut = new InMemoryCache();
        sut.set(key, new CacheEntry(value, 150));
        setTimeout(() => {
            expect(sut.get(key)).to.not.be.undefined;
            sut.resetTtl(key);
            setTimeout(() => {
                // still must be there
                expect(sut.get(key)).to.not.be.undefined;
                done();            
            }, 100);
        }, 100);
    });


});