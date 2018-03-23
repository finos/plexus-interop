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
import { LimitedBufferQueue, Arrays, Logger, LoggerFactory } from "@plexus-interop/common";

let globalObj: any = typeof window !== "undefined" ? window : global;

type Chunk = {
    isLast: boolean,
    buffer: ArrayBuffer
};

/**
 * To mitigate browser issues with concatenating of multiple small chunks into huge one
 */
export class SafeMessageBuffer {

    private readonly log: Logger = LoggerFactory.getLogger("SafeMessageBuffer");

    private readonly maxChunksQueueSize: number = 10 * 1024;
    private buffer: ArrayBuffer = new ArrayBuffer(0);
    private chunksQueue: Queue<Chunk> = new LimitedBufferQueue(this.maxChunksQueueSize);
    private syncTimeoutId: number | null = null;
    private failure: any = null;

    public constructor(
        private readonly onMessage: (b: ArrayBuffer) => void,
        private readonly onError: (e: any) => void = () => { },
        private readonly syncSizeThreshold: number = 1024 * 1024,
        private readonly throttlingPeriod: number = 500,
        private readonly batchSize: number = 50) { }

    public getCurrentBuffer(): ArrayBuffer {
        return this.buffer;
    }

    public addChunk(buffer: ArrayBuffer, isLast: boolean): void {
        if (this.failure) {
            throw this.failure;
        }
        const queueEmpty = this.chunksQueue.isEmpty();
        const reachedLimit = !queueEmpty || buffer.byteLength + this.buffer.byteLength > this.syncSizeThreshold;
        try {
            if (reachedLimit) {
                this.log.trace(`Reached limit of ${this.syncSizeThreshold} bytes, adding chunk to queue`);
                this.chunksQueue.enqueue({ buffer, isLast });
                this.scheduleFlush();
            } else if (isLast) {
                this.onMessage(Arrays.concatenateBuffers(this.buffer, buffer));
                this.buffer = new ArrayBuffer(0);
            } else {
                this.buffer = Arrays.concatenateBuffers(this.buffer, buffer);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    public hasPendingChunks(): boolean {
        return !this.chunksQueue.isEmpty();
    }

    private scheduleFlush(): void {
        if (!this.syncTimeoutId) {
            this.syncTimeoutId = globalObj.setTimeout(() => {
                try {
                    this.syncTimeoutId = null;
                    this.log.info(`Increasing buffer with ${this.chunksQueue.size() < this.batchSize ? this.chunksQueue.size() : this.batchSize} chunks`);
                    this.buffer = this.flushChunks(this.buffer, this.chunksQueue, this.batchSize);
                    this.log.info(`Current buffer size - ${this.buffer.byteLength} bytes, ${this.chunksQueue.size()} chunks in queue`);
                    if (!this.chunksQueue.isEmpty()) {
                        this.scheduleFlush();
                    }
                } catch (error) {
                    this.handleError(error);
                }
            }, this.throttlingPeriod);
        }
    }

    private flushChunks(resultBuffer: ArrayBuffer, chunksQueue: Queue<Chunk>, batchSize: number): ArrayBuffer {
        let chunksBuffer = new ArrayBuffer(0);
        let last = false;
        // concatenate small chunks together first
        while (!last && !chunksQueue.isEmpty() && batchSize > 0) {
            const { buffer, isLast } = chunksQueue.dequeue();
            last = isLast;
            chunksBuffer = Arrays.concatenateBuffers(chunksBuffer, buffer);
            batchSize--;
        }
        // now we can append to result buffer
        if (last) {
            this.onMessage(Arrays.concatenateBuffers(resultBuffer, chunksBuffer));
            return new ArrayBuffer(0);
        } else {
            resultBuffer = Arrays.concatenateBuffers(resultBuffer, chunksBuffer);
            return resultBuffer;
        }
    }

    private handleError(e: any): void {
        this.log.error("Failed on updating the buffer", e);
        this.failure = e;
        this.buffer = new ArrayBuffer(0);
        this.onError(e);
    }

}