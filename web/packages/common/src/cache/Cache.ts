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
import { CacheEntry } from "./CacheEntry";

export interface Cache {

    /*
    * Sets new entry for specific key, if entry already exists - then it will be evicted with calling appropriate dispose method
    */
    set<T>(key: string, entry: CacheEntry<T>, ttl?: number): Promise<void>;

    /**
     * Gets current entry
     */
    get<T>(key: string): T | undefined;

    /**
     * Resets ttl for corresponding entry
     */
    resetTtl(key: string): boolean;

    /*
    * All not expired keys
    */
    keys(): string[];

}