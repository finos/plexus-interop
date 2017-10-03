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
import { ChannelsHolder } from "./ChannelsHolder";
import { Channel } from "./Channel";
import { BlockingQueue, BlockingQueueBase, CancellationToken } from "@plexus-interop/common";

export class BufferedChannelsHolder<ChannelType extends Channel, ChannelDescriptionType> implements ChannelsHolder<ChannelType, ChannelDescriptionType> {

    constructor(
        protected incomingChannelsBuffer: BlockingQueue<ChannelType> = new BlockingQueueBase<ChannelType>(),
        protected channels: Map<string, ChannelDescriptionType> = new Map()
    ) { }

    public waitForIncomingChannel(cancellationToken?: CancellationToken): Promise<ChannelType> {
        return this.incomingChannelsBuffer.blockingDequeue(cancellationToken);
    }

    public async enqueueIncomingChannel(channel: ChannelType): Promise<void> {
        this.incomingChannelsBuffer.enqueue(channel);
    }

    public channelExists(strChannelId: string): boolean {
        return this.channels.has(strChannelId);
    }

    public getChannelDescriptor(strChannelId: string): ChannelDescriptionType {
        return this.channels.get(strChannelId) as ChannelDescriptionType;
    }

    public addChannelDescriptor(strChannelId: string, channelDescriptor: ChannelDescriptionType): void {
        this.channels.set(strChannelId, channelDescriptor);
    }

    public async clearAll(): Promise<void> {
        this.channels.clear();
    }

    public async clear(strChannelId: string): Promise<void> {
        this.channels.delete(strChannelId);
    }

    public getIncomingChannelsSize(): number {
        return this.incomingChannelsBuffer.size();
    }

    public getChannels():  Map<string, ChannelDescriptionType> {
        return this.channels;
    } 
}