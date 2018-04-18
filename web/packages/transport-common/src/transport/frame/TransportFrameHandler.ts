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
import { Frame, MessageFrame, ConnectionCloseFrame, ChannelOpenFrame, ChannelCloseFrame } from './model';
import { ConnectionOpenFrame } from './model/ConnectionOpenFrame';
import { Logger } from '@plexus-interop/common';
import { TransportFrameListener } from './TransportFrameListener';

export class TransportFrameHandler {

    public handleFrame(baseFrame: Frame, log: Logger, typedFramesListener: TransportFrameListener): void {
        if (!baseFrame) {
            log.warn('Empty frame header, dropping frame');
        } else if (baseFrame.internalHeaderProperties.messageFrame) {
            typedFramesListener.handleMessageFrame(baseFrame as MessageFrame);
        } else if (baseFrame.internalHeaderProperties.close) {
            typedFramesListener.handleConnectionCloseFrame(baseFrame as ConnectionCloseFrame);
        } else if (baseFrame.internalHeaderProperties.channelOpen) {
            typedFramesListener.handleChannelOpenFrame(baseFrame as ChannelOpenFrame);
        } else if (baseFrame.internalHeaderProperties.channelClose) {
            typedFramesListener.handleChannelCloseFrame(baseFrame as ChannelCloseFrame);
        } else if (baseFrame.internalHeaderProperties.open) {
            typedFramesListener.handleConnectionOpenFrame(baseFrame as ConnectionOpenFrame);
        } else {
            throw new Error('Unsupported frame type');
        }
    }

}