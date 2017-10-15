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
import { FramedTransportConnection } from "../../../src/transport/frame";
import { TestUtils } from "./util";
import { BufferedObserver } from "../../BufferedObserver";
import { InMemoryFramedTransport } from "../InMemoryFramedTransport";
import { AnonymousSubscription } from "rxjs/Subscription";
import { DelegateChannelObserver } from "../../../src/common/DelegateChannelObserver";
import { UniqueId } from "../../../src/transport/UniqueId";
import { ChannelOpenFrame } from "../../../src/transport/frame/model/ChannelOpenFrame";

describe("FramedTransportConnection", () => {

    it("Doesn't add created channel to incoming channels queue", (done) => {
        let mockFrameTransport = new InMemoryFramedTransport();
        const transportConnection = new FramedTransportConnection(mockFrameTransport);
        transportConnection
            .open()
            .then(() => {
                (async () => {
                    const channel = await transportConnection.createChannel();
                    expect(channel).toBeDefined();
                    expect(transportConnection.getIncomingChannelsSize()).toBe(0);
                    await transportConnection.closeAndCleanUp();
                    done();
                })();
            });
    });

    it("Delivers messages to different channels", (done) => {
        
        let mockFrameTransport = new InMemoryFramedTransport();

        const firstChannelId = UniqueId.generateNew();
        const secondChannelId = UniqueId.generateNew();

        mockFrameTransport.inBuffer.enqueue(ChannelOpenFrame.fromHeaderData({
            channelId: firstChannelId
        }));
        mockFrameTransport.inBuffer.enqueue(ChannelOpenFrame.fromHeaderData({
            channelId: secondChannelId
        }));

        TestUtils.twoShuffeledMessages(firstChannelId, secondChannelId).forEach(frame => {
            mockFrameTransport.inBuffer.enqueue(frame);
        });

        const transportConnection = new FramedTransportConnection(mockFrameTransport);
        
        transportConnection
            .open()
            .then(() => {
                (async () => {
                    // channels created
                    const first = await transportConnection.waitForChannel();
                    expect(first).toBeDefined();
                    const second = await transportConnection.waitForChannel();
                    expect(second).toBeDefined();

                    // messages delivered
                    const firstObserver = new BufferedObserver<ArrayBuffer>();
                    const firstSubscription = 
                        await new Promise<AnonymousSubscription>(
                            (resolve, reject) => first.open(new DelegateChannelObserver(firstObserver, (s) => resolve(s))));

                    const secondObserver = new BufferedObserver<ArrayBuffer>();
                    const secondSubscription = 
                        await new Promise<AnonymousSubscription>(
                            (resolve, reject) => second.open(new DelegateChannelObserver(secondObserver, (s) => resolve(s))));
                    
                    const message = await firstObserver.pullData();
                    expect(message).toBeDefined();
                    const secondMessage = await secondObserver.pullData();
                    expect(secondMessage).toBeDefined();
                    firstSubscription.unsubscribe();
                    secondSubscription.unsubscribe();
                    await transportConnection.closeAndCleanUp();
                    done();
                })();
            });

    });

});