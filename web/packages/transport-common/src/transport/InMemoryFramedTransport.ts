/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { ConnectableFramedTransport, Defaults, UniqueId, Frame } from '../.';
import { ReadWriteCancellationToken, Observer, Logger, LoggerFactory } from '@plexus-interop/common';
import { BufferedObserver } from '../common';

export class InMemoryFramedTransport implements ConnectableFramedTransport {

    private id: UniqueId = UniqueId.generateNew();

    private cancellationToken: ReadWriteCancellationToken = new ReadWriteCancellationToken();

    private readonly log: Logger;

    constructor(
        private inObserver: BufferedObserver<Frame>,
        private outObserver: Observer<Frame>
    ) {
        this.log = LoggerFactory.getLogger(`InMemoryFramedTransport [${this.id.toString()}]`);
        this.log.trace('Created');
    }

    public connected(): boolean {
        return !this.cancellationToken.isCancelled();
    }

    public async disconnect(): Promise<void> {
        this.log.trace('Received disconnect');
        this.cancellationToken.cancel();
        this.inObserver.complete();
    }

    public uuid(): UniqueId {
        return this.id;
    }

    public getMaxFrameSize(): number {
        return Defaults.DEFAULT_FRAME_SIZE;
    }

    public async writeFrame(frame: Frame): Promise<void> {
        this.cancellationToken.throwIfCanceled();
        if (this.log.isTraceEnabled()) {
            if (frame.isDataFrame()) {
                this.log.trace(`Received data frame`);
            } else {
                this.log.trace(`Received header frame`);
            }
        }
        this.outObserver.next(frame);
    }

    public async open(observer: Observer<Frame>): Promise<void> {
        this.log.trace('Transport opened');
        this.inObserver.setObserver(observer);
    }
}