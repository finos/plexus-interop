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
import { getBaseWsUrl } from '../../src/client/api/container/WsConnectionDetails';

describe('WsConnectionDetails', () => {
    it('getBaseWsUrl returns correct result', () => {
        const url = getBaseWsUrl({ port: 42, wssPort: 24 });
        expect(url).toBe("wss://127.0.0.1:24");
    });

    it('getBaseWsUrl if wssPort not defined', () => {
        const url = getBaseWsUrl({ port: 42 });
        expect(url).toBe("ws://127.0.0.1:42");
    });

    it('getBaseWsUrl if wssPort zero', () => {
        const url = getBaseWsUrl({ port: 42, wssPort: 0 });
        expect(url).toBe("ws://127.0.0.1:42");
    });
});
