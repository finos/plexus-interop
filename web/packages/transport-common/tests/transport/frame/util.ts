/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
import { Frame, MessageFrame } from '../../../src/transport/frame/model';
import { UniqueId } from '@plexus-interop/protocol';

export class TestUtils {

    public static framedMessage(channelId: UniqueId = UniqueId.generateNew()): Frame[] {
        return [MessageFrame.fromHeaderData(
            {
                channelId,
                hasMore: true,
                length: 1                
            },
            new Uint8Array(1).buffer)
        , MessageFrame.fromHeaderData(
            {
                channelId,
                hasMore: false,
                length: 1
            },
            new Uint8Array(2).buffer)
       ];
    }

    public static secondFramedMessage(channelId: UniqueId = UniqueId.generateNew()): Frame[] {
        return [MessageFrame.fromHeaderData(
            {
                channelId,
                hasMore: true,
                length: 1
            },
            new Uint8Array(1).buffer)
        , MessageFrame.fromHeaderData(
            {
                channelId,
                hasMore: false
            },
            new Uint8Array(2).buffer)
       ];
    }

    public static twoShuffeledMessages(
        firstChannelId: UniqueId, secondChannelId: UniqueId
    ): Frame[] {
        const first = this.framedMessage(firstChannelId);
        const second = this.secondFramedMessage(secondChannelId);
        return [
            first[0], second[0], second[1], first[1]
        ];
    }
}