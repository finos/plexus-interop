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
import { AsyncHelper } from '../../src/util/async/AsyncHelper';
import { CancellationToken } from '../../src/util/async/CancellationToken';


describe('Async Helper', () => {

    it('Should fail if passed timeout passed', (done) => {
        AsyncHelper.waitFor(() => false, new CancellationToken(), 10, 1).catch(() => done());
    });

    it('Should fail if cancellation token cancelled', (done) => {
        const token = new CancellationToken();
        AsyncHelper.waitFor(() => false, token).catch(() => done());
        token.cancel('Cancelled');
    });

    it('Should not fail if cancellation token cancelled but condition is true', (done) => {
        const token = new CancellationToken();
        token.cancel('Cancelled');
        AsyncHelper.waitFor(() => true, token).then(() => done());
    });

});