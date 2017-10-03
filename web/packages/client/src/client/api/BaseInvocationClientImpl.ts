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
import { InvocationClient } from "./InvocationClient";
import { Invocation } from "../generic/Invocation";
import { clientProtocol as plexus, SuccessCompletion, ClientError, CancelledCompletion, ErrorCompletion } from "@plexus-interop/protocol";
import { Logger } from "@plexus-interop/common";

export abstract class BaseInvocationClientImpl implements InvocationClient {

    constructor(protected invocation: Invocation, protected log: Logger) { }

    public async error(clientError: ClientError): Promise<void> {
        this.log.debug(`Client reported error, closing invocation`, JSON.stringify(clientError));
        this.close(new ErrorCompletion(clientError));
    }

    public async cancel(): Promise<void> {
        this.log.debug(`Client cancelled operation, closing invocation`);
        this.close(new CancelledCompletion());
    }

    protected close(completion: plexus.ICompletion = new SuccessCompletion()): void {
        this.invocation.close(completion)
            .then(() => {
                this.log.debug("Closed");
            }, (closeError) => {
                this.log.error("Closed with errors", closeError);
            });
    }
}