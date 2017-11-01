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
import { Queue } from "typescript-collections";
import { CancellationToken } from "../async/CancellationToken";
import { AsyncHelper } from "../async/AsyncHelper";

export abstract class BlockingQueue<T> {
    public abstract async blockingDequeue(cancellationToken?: CancellationToken): Promise<T>;
    public abstract async enqueue(el: T): Promise<void>;
    public abstract size(): number
    public abstract clear(): void;
    public abstract peek(): T;
    public abstract dequeue(): T;
}

export class BlockingQueueBase<T> implements BlockingQueue<T> {

    constructor(private readonly internal: Queue<T> = new Queue<T>()) {}

    public async blockingDequeue(cancellationToken: CancellationToken = new CancellationToken()): Promise<T> {
        if (this.internal.size() > 0) {
            return Promise.resolve(this.internal.dequeue());
        }
        return AsyncHelper
            .waitFor(
                () => this.internal.size() > 0, 
                cancellationToken)
            .then(() => this.internal.dequeue());
    }

    public async enqueue(el: T): Promise<void> {
        this.internal.enqueue(el);
    }

    public size(): number {
        return this.internal.size();
    }

    public clear(): void {
        this.internal.clear();
    }

    public peek(): T {
        return this.internal.peek();
    }

    public dequeue(): T {
        return this.internal.dequeue();
    }

}