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
import { StreamingInvocationClient } from "./StreamingInvocationClient";
import { ClientError, SuccessCompletion } from "@plexus-interop/protocol";
import { Invocation } from "../../generic/Invocation";
import { ClientProtocolHelper } from "../../generic/ClientProtocolHelper";
import { BaseInvocationClientImpl } from "../BaseInvocationClientImpl";
import { Logger } from "@plexus-interop/common";

export class StreamingInvocationClientImpl extends BaseInvocationClientImpl implements StreamingInvocationClient<ArrayBuffer> {

    constructor(invocation: Invocation, log: Logger) {
        super(invocation, log);
    }

    public next(value: ArrayBuffer): Promise<void> {
        this.log.trace(`Sending new message of ${value.byteLength} bytes`);
        return this.invocation.sendMessage(value);
    };

    public async complete(): Promise<void> {
        this.log.trace(`Complete operation requested`);
        const completion = await this.invocation.close(new SuccessCompletion());
        if (!ClientProtocolHelper.isSuccessCompletion(completion)) {
            this.log.error(`Completed with errors`, completion ? completion.error : "Completion is empty");
            throw completion && completion.error ? completion.error : new ClientError("Completed with errors");
        }
    }

}