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
import { BlockingQueue, BlockingQueueBase } from "./BlockingQueue";
import { CancellationToken } from "../async/CancellationToken";
import { Logger } from "../../logger/Logger";
import { LoggerFactory } from "../../logger/LoggerFactory";

export class ElementDescriptor<T> {
    constructor(public readonly data: T, public readonly expirationTs: number) { }
}

export class EvictionBlockingQueue<T> implements BlockingQueue<T> {

    private cleanUpTimeout: any;

    private readonly log: Logger;

    constructor(
        private id: string = "EMPTY_GUID",
        private readonly ttl: number = 60000,
        private readonly base: BlockingQueue<ElementDescriptor<T>> = new BlockingQueueBase<ElementDescriptor<T>>()) {
        this.log = LoggerFactory.getLogger(`EvictionBlockingQueue [${id}]`);
    }

    public async blockingDequeue(cancellationToken?: CancellationToken): Promise<T> {
        return this.base.blockingDequeue(cancellationToken).then((descriptor) => descriptor.data);
    }

    public size(): number {
        return this.base.size();
    }

    public clear(): void {
        this.base.clear();
    }

    public async enqueue(el: T): Promise<void> {
        const descriptor = new ElementDescriptor(el, new Date().getTime() + this.ttl);
        this.base.enqueue(descriptor);
        this.restartCleanUp();
    }

    private restartCleanUp(): void {
        if (this.cleanUpTimeout) {
            clearTimeout(this.cleanUpTimeout);
        }
        this.cleanUpTimeout = setTimeout(() => {
            this.performCleanUp();
        }, this.ttl);
    }

    public peek(): T {
        return this.base.peek().data;
    }

    public dequeue(): T {
        return this.base.dequeue().data;
    }

    private performCleanUp(): void {
        const currentTime = new Date().getTime();
        while (this.base.size() > 0 && this.base.peek().expirationTs <= currentTime) {
            this.log.trace(`Removing element due to passed ttl`);
            this.base.dequeue();
        }
    }

}