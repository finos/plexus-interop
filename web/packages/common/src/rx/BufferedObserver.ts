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
import { Observer } from "./Observer";
import { Queue } from "typescript-collections";
import { Logger, LoggerFactory } from "../logger";
import { LimitedBufferQueue } from "../util/collections/LimitedBufferQueue";

/**
 * Saves interraction with Observer, until real Observer arrives
 */
export class BufferedObserver<T> implements Observer<T> {
    
    private baseObserver: Observer<T> | undefined;

    private buffer: Queue<T>;
    private receivedError: any;
    private completed: boolean = false;

    constructor(readonly limit: number = 1024 * 10, private readonly log: Logger = LoggerFactory.getLogger("BufferedObserver")) {
        this.buffer = new LimitedBufferQueue<T>(limit);
    }

    public setObserver(observer: Observer<T>): void {
        if (this.baseObserver) {
            throw new Error("Base observer already defined");
        }
        this.baseObserver = observer;
        while (!this.buffer.isEmpty()) {
            observer.next(this.buffer.dequeue());
        }
        if (this.receivedError) {
            observer.error(this.receivedError);
        } else if (this.completed) {
            observer.complete();
        }
    }

    public next(value: T): void {
        if (this.baseObserver) {
            /* istanbul ignore if */
            if (this.log.isTraceEnabled()) {
                this.log.trace(`Passing frame to observer`);
            }
            this.baseObserver.next(value);
        } else {
            /* istanbul ignore if */
            if (this.log.isTraceEnabled()) {
                this.log.trace(`No observer, adding to buffer, buffer size ${this.buffer.size()}`);
            }
            this.buffer.enqueue(value);
        }
    }

    public error(err: any): void {
        if (this.baseObserver) {
            this.baseObserver.error(err);
        } else {
            this.receivedError = err;
        }
    } 

    public complete(): void {
        if (this.baseObserver) {
            this.baseObserver.complete();
        } else {
            this.completed = true;
        }
    }

    public clear(): void {
        this.buffer.clear();
    }

}