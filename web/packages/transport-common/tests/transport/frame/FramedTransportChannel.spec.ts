/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { FramedTransport, FramedTransportChannel } from '../../../src/transport/frame';
import { UniqueId } from '@plexus-interop/protocol';
import { TestUtils } from './util';
import { mock, instance, when, anything } from 'ts-mockito';
import { CancellationToken, AsyncHelper } from '@plexus-interop/common';
import { Observer } from '@plexus-interop/common';
import { LogObserver } from '../../LogObserver';
import { TestBufferedInMemoryFramedTransport } from '../TestBufferedInMemoryFramedTransport';
import { Frame } from '../../../src/transport/frame/model/Frame';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { DelegateChannelObserver } from '../../../src/common/DelegateChannelObserver';
import { Queue } from 'typescript-collections';

describe('FramedTransportChannel', () => {

    it('Concatenates message from frames', (done) => {

        const mockFrameTransport = new TestBufferedInMemoryFramedTransport();

        TestUtils.framedMessage().forEach(frame => {
            mockFrameTransport.next(frame);
        });
        const cancellationToken = new CancellationToken();
        const sut = new FramedTransportChannel(UniqueId.generateNew(), mockFrameTransport, async () => { }, cancellationToken);
        sut.open({
            startFailed: () => {},
            started: () => {},            
            next: (result) => {
                expect(result.byteLength > 0).toBeTruthy();
                cancellationToken.cancel();
                done();
            },
            complete: () => { },
            error: () => { }
        });

    });

    it('Reports error to observable if can\'t read frame', (done) => {

        const mockFrameTransport: FramedTransport = mock(TestBufferedInMemoryFramedTransport);

        TestUtils.framedMessage().forEach(frame => {
            when(mockFrameTransport.open(anything())).thenReturn(Promise.reject(new Error('Transport error')));
        });

        const sut = new FramedTransportChannel(UniqueId.generateNew(), instance(mockFrameTransport), async () => { }, new CancellationToken());
        sut.open({
            startFailed: () => {},            
            started: () => {},
            next: () => {
                fail('Not expected');
            },
            complete: () => {
                fail('Not expected');
            },
            error: (e) => {
                expect(e).toBeDefined();
                done();
            }
        });

    });

    it('Rejects request if already opened', async (done) => {

        const mockFrameTransport = new TestBufferedInMemoryFramedTransport();

        TestUtils.framedMessage().forEach(frame => {
            mockFrameTransport.next(frame);
        });
        const cancellationToken = new CancellationToken();

        const sut = new FramedTransportChannel(UniqueId.generateNew(), mockFrameTransport, async () => { }, cancellationToken);
        const observer: Observer<ArrayBuffer> = {
            next: (result: ArrayBuffer) => {
                expect(result.byteLength > 0).toBeTruthy();
                cancellationToken.cancel();
                done();
            },
            complete: () => { },
            error: () => { }
        };
        
        await new Promise<AnonymousSubscription>(
            (resolve, reject) => sut.open(new DelegateChannelObserver(observer, (s) => resolve(s))));

        new Promise<AnonymousSubscription>(
            (resolve, reject) => sut.open(new DelegateChannelObserver(observer, (s) => resolve(s))))
            .catch(() => done());
    });

    it('Sends big message by frames', async (done) => {

        const mockFrameTransport = new TestBufferedInMemoryFramedTransport(UniqueId.generateNew(), new Queue<Frame>(), new Queue<Frame>(), 3);
        const dataArray = [1, 2, 3, 4, 5];
        const dataToSend = new Uint8Array(dataArray);
        const channelId = UniqueId.generateNew();
        const cancellationToken = new CancellationToken();

        const sut = new FramedTransportChannel(channelId, mockFrameTransport, async () => { }, cancellationToken);
        await new Promise<AnonymousSubscription>(
            (resolve, reject) => sut.open(new DelegateChannelObserver(new LogObserver(), (s) => resolve(s))));
                   
        sut.sendMessage(dataToSend.buffer).then(async () => {
            await AsyncHelper.waitFor(() => mockFrameTransport.outBuffer.size() > 0);
            const firstFrame = mockFrameTransport.outBuffer.dequeue();
            expect(firstFrame.getHeaderData().channelId).toEqual(channelId);
            expect(firstFrame.getHeaderData().hasMore).toEqual(true);
            expect(new Uint8Array(firstFrame.body)).toEqual(new Uint8Array([1, 2, 3]));
            await AsyncHelper.waitFor(() => mockFrameTransport.outBuffer.size() > 0);
            const secondFrame = mockFrameTransport.outBuffer.dequeue();
            expect(secondFrame.getHeaderData().channelId).toEqual(channelId);
            expect(secondFrame.getHeaderData().hasMore).toEqual(false);
            expect(new Uint8Array(secondFrame.body)).toEqual(new Uint8Array([4, 5]));
            cancellationToken.cancel();
            done();
        });
    });

});