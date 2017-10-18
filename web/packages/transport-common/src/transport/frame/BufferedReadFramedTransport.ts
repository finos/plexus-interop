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
import { UniqueId } from "../UniqueId";
import { Frame } from "./model";
import { FramedTransport } from "./FramedTransport";
import { Observer, Logger, LimitedBufferQueue } from "@plexus-interop/common";
import { Queue } from "typescript-collections";
import { Defaults } from "../../common/Defaults";

/**
 * Collects all read events until client opened connection
 */
export abstract class BufferedReadFramedTransport implements FramedTransport, Observer<Frame> {

    protected framesObserver: Observer<Frame> | null = null;
    protected completed: boolean = false;
    protected receivedError: any;
    protected inBuffer: Queue<Frame> = new LimitedBufferQueue<Frame>(Defaults.DEFAULT_BUFFER_SIZE);

    constructor(
        protected readonly log: Logger) { }

    public abstract uuid(): UniqueId;

    public abstract getMaxFrameSize(): number;

    public abstract writeFrame(frame: Frame): Promise<void>;

    public async open(framesObserver: Observer<Frame>): Promise<void> {
        this.log.trace("Opening transport");
        if (this.framesObserver) {
            throw new Error("Already opened");
        }
        this.framesObserver = framesObserver;
        while (!this.inBuffer.isEmpty()) {
            this.framesObserver.next(this.inBuffer.dequeue());
        }
        if (this.receivedError) {
            this.framesObserver.error(this.receivedError);
        } else if (this.completed) {
            this.framesObserver.complete();
        }
    }

    public clear(): void {
        this.inBuffer.clear();
    }

    public next(frame: Frame): void {
        /* istanbul ignore if */ 
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Received frame`);
        }
        if (this.framesObserver) {
            this.framesObserver.next(frame);
        } else {
            this.inBuffer.enqueue(frame);
        }
    }

    public error(transportError: any): void {
        this.log.debug("Received error", transportError);
        if (this.framesObserver) {
            this.framesObserver.error(transportError);
        } else {
            this.receivedError = transportError;
        }
    }

    public complete(): void {
        this.log.debug("Receive complete message");
        if (this.framesObserver) {
            this.framesObserver.complete();
        } else {
            this.completed = true;
        }
    }

}