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
import { Cache } from "./Cache";
import { CacheEntry } from "./CacheEntry";
import { CacheEntryDescriptor } from "./CacheEntryDescriptor";
import { Logger, LoggerFactory } from "../logger";

let globalObj: any = typeof window !== "undefined" ? window : global;

export class InMemoryCache implements Cache {

    private readonly log: Logger = LoggerFactory.getLogger("InMemoryCache");

    private storage: Map<string, CacheEntryDescriptor<any>> = new Map();

    public async set<T>(key: string, entry: CacheEntry<T>, ttl?: number): Promise<void> {
        const existing = this.storage.get(key);
        if (existing) {
            this.log.trace(`${key} already exist, cleaning up and calling dispose`);
            clearTimeout(existing.cleanUpTimeOutId);
            existing.entry.onEvict(existing.entry.value);
        }
        let cleanUpTimeout = -1;
        if (entry.ttl > 0) {
            cleanUpTimeout = globalObj.setTimeout(() => this.cleanEntry(key), entry.ttl);
        }
        this.storage.set(key, new CacheEntryDescriptor(
            entry, 
            entry.ttl > 0 ? Date.now() + entry.ttl : -1,
            cleanUpTimeout
        ));
    }

    public resetTtl(key: string): boolean {
        const descriptor = this.storage.get(key);
        if (descriptor && descriptor.entry.ttl > 0) {
            clearTimeout(descriptor.cleanUpTimeOutId);
            descriptor.cleanUpTimeOutId = 
                globalObj.setTimeout(() => this.cleanEntry(key), descriptor.entry.ttl);
        }       
        return false;
    }

    public keys(): string[] {
        return [];
    }

    public get<T>(key: string): T | undefined {
        const descriptor = this.storage.get(key);
        if (descriptor) {
            return descriptor.entry.value;
        } else {
            return undefined;
        }
    }

    private cleanEntry(key: string): void {
        const descriptor = this.storage.get(key);
        if (descriptor) {
            this.log.trace(`[${descriptor.entry.ttl}] passed for [${key}] element, cleaning up`);
            descriptor.entry.onEvict(descriptor.entry.value);
            this.storage.delete(key);
        }
    }

} 