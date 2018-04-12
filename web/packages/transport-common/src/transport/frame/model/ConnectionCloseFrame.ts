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
import { transportProtocol as plexus } from '@plexus-interop/protocol';
import { ServiceFrame } from './ServiceFrame';

export class ConnectionCloseFrame extends ServiceFrame<plexus.interop.transport.protocol.IConnectionCloseHeader> {

    public constructor(header: plexus.interop.transport.protocol.IHeader) {
        super();
        this._header = header;
    }

    public static fromHeaderData(headerData: plexus.interop.transport.protocol.IConnectionCloseHeader): ConnectionCloseFrame {
        return new ConnectionCloseFrame({
            close: headerData
        });
    }

    public getHeaderData(): plexus.interop.transport.protocol.IConnectionCloseHeader {
        return this._header.close as plexus.interop.transport.protocol.IConnectionCloseHeader;
    }

}