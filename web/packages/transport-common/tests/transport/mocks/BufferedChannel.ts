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
import { UniqueId } from "../../../src/transport/UniqueId";
import { Observer } from "@plexus-interop/common";
import { Subscription } from "rxjs/Subscription";
import { TransportChannel } from "../../../src/transport/TransportChannel";
import { clientProtocol as plexus, SuccessCompletion} from "@plexus-interop/protocol";
import { Logger, LoggerFactory, BlockingQueue, BlockingQueueBase, CancellationToken } from "@plexus-interop/common";

export class BufferedChannel implements TransportChannel {

    private log: Logger = LoggerFactory.getLogger("Test Channel");

    public readonly in: BlockingQueue<ArrayBuffer> = new BlockingQueueBase<ArrayBuffer>();
    public readonly out: BlockingQueue<ArrayBuffer> = new BlockingQueueBase<ArrayBuffer>();
    public readonly id: UniqueId = UniqueId.generateNew();

    constructor(private cancellationToken: CancellationToken) {
        this.log.info("Created");
    }

    public async open(observer: Observer<ArrayBuffer>): Promise<Subscription> {
        const subscription = new Subscription(() => this.cancellationToken.cancel("unsubscribed"));
        this.listenToMessages(observer);
        return subscription;
    }

    private async listenToMessages(observer: Observer<ArrayBuffer>): Promise<void> {
        try {
            while (!this.cancellationToken.isCancelled()) {
                const message = await this.in.blockingDequeue(this.cancellationToken);
                console.log(`Got in message from buffer ${message.byteLength} bytes`);
                observer.next(message);
            }
            observer.complete();
        } catch (error) {
            console.error("Error on reading message", error);
            observer.error(error);
        }
    }

    public addToInbox(data: ArrayBuffer): Promise<void> {
        this.log.debug(`Adding ${data.byteLength} bytes to inbox`);
        return this.in.enqueue(data);
    }

    public pullOutMessage(): Promise<ArrayBuffer> {
        return this.out.blockingDequeue(this.cancellationToken);
    }

    public isInboxEmpty(): boolean {
        return this.in.size() === 0;
    }

    public async sendMessage(data: ArrayBuffer): Promise<void> {
        this.log.debug(`Sending ${data.byteLength} bytes`);
        this.out.enqueue(data);
    }

    public async sendLastMessage(data: ArrayBuffer): Promise<plexus.ICompletion> {
        await this.sendMessage(data);
        return this.close;
    }

    public cancel(): void {
        this.cancellationToken.cancel("Closed");
    }

    public async close(): Promise<SuccessCompletion> {
        this.log.info("Close requested");
        this.cancel();
        return new SuccessCompletion();
    }

    public uuid(): UniqueId {
        return this.id;
    }

}