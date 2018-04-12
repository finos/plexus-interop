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
import { SafeMessageBuffer } from '../../../src';

describe('SafeMessagesBuffer', () => {

    it('Performs sync buffer increase if limit not reached', () => {
        
        const first = new Uint32Array([1, 2, 3]);
        const second = new Uint32Array([5, 6, 7]);

        const safeBuffer = new SafeMessageBuffer(() => {});
        safeBuffer.addChunk(first.buffer, false);
        safeBuffer.addChunk(second.buffer, false);

        expect(new Uint32Array(safeBuffer.getCurrentBuffer()))
            .toEqual(new Uint32Array([1, 2, 3, 5, 6, 7]));
            
    });

    it('Adds chunks to queue if reached the limit and concatenate after timeout', done => {
        
        const first = new Uint32Array([1, 2, 3]);
        const second = new Uint32Array([5, 6, 7]);

        const safeBuffer = new SafeMessageBuffer(() => {}, () => {}, 1, 10);

        safeBuffer.addChunk(first.buffer, false);
        safeBuffer.addChunk(second.buffer, false);
        expect(safeBuffer.getCurrentBuffer().byteLength).toEqual(0);

        setTimeout(() => {
            expect(new Uint32Array(safeBuffer.getCurrentBuffer()))
                .toEqual(new Uint32Array([1, 2, 3, 5, 6, 7]));
            done();
        }, 50);
            
    });

    it('Forces message and buffer flush if last chunk received', done => {
        
        const first = new Uint32Array([1, 2, 3]);
        const second = new Uint32Array([5, 6, 7]);
        const third = new Uint32Array([8]);        

        const safeBuffer = new SafeMessageBuffer(message => {
            expect(new Uint32Array(message))
                .toEqual(new Uint32Array([1, 2, 3, 5, 6, 7, 8]));
            done();
        }, () => {}, 1, 10, 1);

        safeBuffer.addChunk(first.buffer, false);
        safeBuffer.addChunk(second.buffer, false);
        safeBuffer.addChunk(third.buffer, true);
            
    });

});