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
/**
 * Call source fn only once, even if source promise is rejected
 */
export const once = <Req, Res>(fn: (req?: Req) => Promise<Res>): (req?: Req) => Promise<Res> => {
    let promise: Promise<Res> | undefined;
    return (req?: Req) => {
        if (!promise) {
            promise = fn(req);
        }
        return promise;
    };
};