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
import { Channel } from "./Channel";
import { CancellationToken } from "@plexus-interop/common";

export interface ChannelsHolder<ChannelType extends Channel, ChannelDescriptorType> {

    waitForIncomingChannel(cancellationToken?: CancellationToken): Promise<ChannelType>;

    enqueueIncomingChannel(channel: ChannelType): Promise<void>;

    channelExists(strChannelId: string): boolean;

    getChannelDescriptor(strChannelId: string): ChannelDescriptorType;

    addChannelDescriptor(strChannelId: string, channelDescriptor: ChannelDescriptorType): void;

    clearAll(): Promise<void>;

    clear(strChannelId: string): Promise<void>;

    getChannels():  Map<string, ChannelDescriptorType>;

    getIncomingChannelsSize(): number;

}