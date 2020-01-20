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
import { UniqueId } from '@plexus-interop/protocol';
import { Frame } from '../../src/transport/frame/model/Frame';
import { ConnectableFramedTransport } from '../../src/transport/frame/ConnectableFramedTransport';
import { LoggerFactory, Observer, Logger } from '@plexus-interop/common';
import { BufferedReadFramedTransport } from '../../src/transport/frame/BufferedReadFramedTransport';
import { default as Queue } from 'typescript-collections/dist/lib/Queue';
import { AsyncHelper, CancellationToken } from '@plexus-interop/common';

export class TestBufferedInMemoryFramedTransport extends BufferedReadFramedTransport implements ConnectableFramedTransport {

    private connectionToken: CancellationToken = new CancellationToken();

    constructor(
        private readonly guid: UniqueId = UniqueId.generateNew(),
        inBuffer: Queue<Frame> = new Queue<Frame>(),
        public readonly outBuffer: Queue<Frame> = new Queue<Frame>(),
        public readonly bufferSize: number = 8,
        log: Logger = LoggerFactory.getLogger('BufferedInMemoryFramedTransport')) {
        super(log);
        this.inBuffer = inBuffer;
    }

    public uuid(): UniqueId {
        return this.guid;
    }

    public getMaxFrameSize(): number {
        return this.bufferSize;
    }

    public async open(framesObserver: Observer<Frame>): Promise<void> {
        await super.open(framesObserver);
        this.listenForInbox().catch(e => this.log.error('Stopped to listed for inbox with error', e));
    }

    private async listenForInbox(): Promise<void> {
        this.log.debug('Starting to listen for more frames');        
        while (this.connected() && !this.completed) {
            this.log.debug('Waiting for new frames to come');
            await AsyncHelper.waitFor(() => this.inBuffer.size() > 0, this.connectionToken, 10, 5000);
            this.log.debug('Some frames arrived, passing to observer');
            while (this.inBuffer.size() > 0) {
                this.next(this.inBuffer.dequeue());
            }
        }
        this.log.debug('Stopped to listen for frames');
    }

    public async writeFrame(frame: Frame): Promise<void> {
        this.log.debug('Write frame');
        this.outBuffer.enqueue(frame);
    }

    public async disconnect(): Promise<void> {
        this.log.debug('Disconnect');
        this.connectionToken.cancel();
    }

    public connected(): boolean {
        return !this.connectionToken.isCancelled();
    }
}