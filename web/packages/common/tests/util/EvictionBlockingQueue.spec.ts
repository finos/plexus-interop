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
import {EvictionBlockingQueue} from "../../src/util/collections/EvictionBlockingQueue";
import {AsyncHelper} from "../../src/util/async/AsyncHelper";

describe("EvictionBlockingQueue", () => {

    it("Should keep value if timeout not passed", (done) => {
        const sut = new EvictionBlockingQueue("GUID", 1000);
        const value = "A";
        sut.enqueue(value);
        setTimeout(() => {
            expect(sut.dequeue()).toEqual(value);
            done();
        }, 10);
    });

    it("Should keep value if timeout not passed (blocking)", async (done) => {
        const sut = new EvictionBlockingQueue("GUID", 1000);
        const value = "A";
        sut.enqueue(value);
        setTimeout(() => {
            sut.blockingDequeue().then((received) => {
                expect(received).toEqual(value);
                done();
            });
        }, 10);
    });

    it("Should evict value if timeout passed", (done) => {
        const sut = new EvictionBlockingQueue("GUID", 1);
        const value = "A";
        sut.enqueue(value);
        AsyncHelper.waitFor(() => sut.size() === 0).then(done);
    });

});


