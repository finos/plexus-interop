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
import { Observer, Logger, CancellationToken } from "@plexus-interop/common";
import { Queue } from "typescript-collections";

export class ChannelTransportProxy implements FramedTransport, Observer<Frame> {

    private framesObserver: Observer<Frame> | null = null;

    private completed: boolean = false;
    private receivedError: any;
    private inBuffer: Queue<Frame> = new Queue<Frame>();

    constructor(
        private readonly innerTransport: FramedTransport,
        private readonly writeCancellationToken: CancellationToken,
        private readonly log: Logger) { }

    public uuid(): UniqueId {
        return this.innerTransport.uuid();
    }

    public async open(framesObserver: Observer<Frame>): Promise<void> {
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

    public getMaxFrameSize(): number {
        return this.innerTransport.getMaxFrameSize();
    }

    public async writeFrame(frame: Frame): Promise<void> {
        this.writeCancellationToken.throwIfCanceled();
        return this.innerTransport.writeFrame(frame);
    }

    public next(frame: Frame): void {
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
        this.log.debug("Received error", transportError)
        if (this.framesObserver) {
            this.framesObserver.error(transportError);
        } else {
            this.receivedError = transportError;
        }
    }

    public complete(): void {
        this.log.debug("Receive complete message")
        if (this.framesObserver) {
            this.framesObserver.complete();
        } else {
            this.completed = true;
        }
    }

}