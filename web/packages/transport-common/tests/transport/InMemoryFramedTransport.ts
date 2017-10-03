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
import { UniqueId } from "../../src/transport/UniqueId";
import { Frame } from "../../src/transport/frame/model/Frame";
import { BlockingQueue, BlockingQueueBase } from "@plexus-interop/common";
import { ConnectableFramedTransport } from "../../src/transport/frame/ConnectableFramedTransport";
import { CancellationToken } from "@plexus-interop/common";
import { LoggerFactory } from "@plexus-interop/common";
import { Logger } from "@plexus-interop/common";

export class InMemoryFramedTransport implements ConnectableFramedTransport {

    private connectedFlag: boolean = true;

    private log: Logger = LoggerFactory.getLogger("InMemoryFramedTransport");

    constructor(
        private readonly guid: UniqueId = UniqueId.generateNew(),
        public readonly inBuffer: BlockingQueue<Frame> = new BlockingQueueBase<Frame>(),
        public readonly outBuffer: BlockingQueue<Frame> = new BlockingQueueBase<Frame>(),
        public readonly bufferSize: number = 8) { }

    public uuid(): UniqueId {
        return this.guid;
    }

    public getMaxFrameSize(): number {
        return this.bufferSize;
    }

    public async writeFrame(frame: Frame): Promise<void> {
        this.log.debug("Write frame");
        this.outBuffer.enqueue(frame);
    }

    public async readFrame(cancellationToken: CancellationToken): Promise<Frame> {
        this.log.debug("Read frame");        
        return this.inBuffer.blockingDequeue(cancellationToken);
    }

    public async disconnect(): Promise<void> {
        this.log.debug("Disconnect");                
        this.connectedFlag = false;
    }

    public connected(): boolean {
        return this.connectedFlag;
    }

}