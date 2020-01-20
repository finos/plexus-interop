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
import { transportProtocol as plexus } from '@plexus-interop/protocol';
import { DataFrame } from './DataFrame';

export class MessageFrame extends DataFrame<plexus.interop.transport.protocol.IMessageFrameHeader> {

    constructor(header: plexus.interop.transport.protocol.IHeader, body: ArrayBuffer = new Uint8Array([]).buffer) {
        super();
        this._header = header;
        this.body = body;
    }

    public static fromHeaderData(headerData: plexus.interop.transport.protocol.IMessageFrameHeader, body?: ArrayBuffer): MessageFrame {
        return new MessageFrame({
            messageFrame: headerData
        }, body);
    }

    public isLast(): boolean {
        return !this.getHeaderData().hasMore;
    }

    public getHeaderData(): plexus.interop.transport.protocol.IMessageFrameHeader {
        return this._header.messageFrame as plexus.interop.transport.protocol.IMessageFrameHeader;
    }
}