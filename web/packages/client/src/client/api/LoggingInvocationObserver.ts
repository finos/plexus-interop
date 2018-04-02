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
import { Logger } from "@plexus-interop/common";
import { InvocationObserver } from "../generic";

export class LoggingInvocationObserver implements InvocationObserver<ArrayBuffer> {

    constructor(private readonly baseObserver: InvocationObserver<ArrayBuffer>, private readonly log: Logger) { }

    public streamCompleted(): void {
        this.log.trace("Stream completed");
        this.baseObserver.streamCompleted();
    }

    public next(payload: ArrayBuffer): void {
        this.log.trace(`Response payload of ${payload.byteLength} received`);
        this.baseObserver.next(payload);
    }

    public error(e: any): void {
        this.log.error(`Error received`, e);
        this.baseObserver.error(e);
    }

    public complete(): void {
        this.log.trace(`Completion received`);
        this.baseObserver.complete();
    }

}