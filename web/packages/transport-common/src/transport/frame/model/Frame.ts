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

export abstract class Frame {

    protected _header: plexus.interop.transport.protocol.IHeader;

    public abstract isDataFrame(): boolean;

    public abstract getHeaderData(): any;

    public get internalHeaderProperties(): plexus.interop.transport.protocol.IHeader {
        return this._header;
    }

    public getInternalHeader(): plexus.interop.transport.protocol.Header {
        return new plexus.interop.transport.protocol.Header(this._header);
    }

    public abstract get body(): ArrayBuffer;

    public abstract set body(body: ArrayBuffer);

}

export abstract class BaseFrame<T> extends Frame {

    private _body: ArrayBuffer;

    public abstract getHeaderData(): T;
    
    public get body(): ArrayBuffer {
        return this._body;
    }
    
    public set body(body: ArrayBuffer) {
        this._body = body;
    }

}