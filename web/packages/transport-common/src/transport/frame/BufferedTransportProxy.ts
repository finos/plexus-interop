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
import { UniqueId } from "@plexus-interop/protocol";
import { Frame } from "./model";
import { FramedTransport } from "./FramedTransport";
import { Logger, CancellationToken } from "@plexus-interop/common";
import { BufferedReadFramedTransport } from "./BufferedReadFramedTransport";

/**
 * Collects all read events until client opened connection, delegates all write events to source
 */
export class BufferedTransportProxy extends BufferedReadFramedTransport {

    constructor(
        private readonly innerTransport: FramedTransport,
        private readonly writeCancellationToken: CancellationToken,
        log: Logger) {
        super(log);
    }

    public uuid(): UniqueId {
        return this.innerTransport.uuid();
    }

    public clear(): void {
        this.inBuffer.clear();
    }

    public getMaxFrameSize(): number {
        return this.innerTransport.getMaxFrameSize();
    }

    public async writeFrame(frame: Frame): Promise<void> {
        this.writeCancellationToken.throwIfCanceled();
        return this.innerTransport.writeFrame(frame);
    }

}