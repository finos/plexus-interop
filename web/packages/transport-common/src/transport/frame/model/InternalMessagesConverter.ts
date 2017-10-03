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
import { Frame } from "./Frame";
import { transportProtocol as plexus } from "@plexus-interop/protocol";
import { ChannelOpenFrame, ChannelCloseFrame, ConnectionCloseFrame, MessageFrame } from ".";
import { ConnectionOpenFrame } from "./ConnectionOpenFrame";
import { Arrays } from "@plexus-interop/common";

export class InternalMessagesConverter {

    public deserialize(data: Uint8Array): Frame {
        const protoFrame: plexus.interop.transport.protocol.Header = plexus.interop.transport.protocol.Header.decode(data);
        const plainData = plexus.interop.transport.protocol.Header.toObject(protoFrame) as plexus.interop.transport.protocol.IHeader;
        if (plainData.channelClose) {
            return new ChannelCloseFrame(plainData);
        } else if (plainData.channelOpen) {
            return new ChannelOpenFrame(plainData);
        } else if (plainData.close) {
            return new ConnectionCloseFrame(plainData);
        } else if (plainData.messageFrame) {
            return new MessageFrame(plainData);
        } else if (plainData.open) {
            return new ConnectionOpenFrame(plainData);
        } else {
            throw new Error("Unsupported frame type");
        }
    }

    public serialize(frame: Frame): ArrayBuffer {
        return Arrays.toArrayBuffer(plexus.interop.transport.protocol.Header.encode(
            frame.internalHeaderProperties
        ).finish());
    }

}
