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
import { InvocationHandlerConverter } from "../InvocationHandlerConverter";
import { ServerStreamingInvocationHandler } from "./ServerStreamingInvocationHandler";
import { BidiStreamingInvocationHandler } from "./BidiStreamingInvocationHandler";
import { StreamingInvocationClient } from "./StreamingInvocationClient";
import { ClientDtoUtils } from "../../ClientDtoUtils";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { MethodInvocationContext } from "@plexus-interop/client-api";

export class ServerStreamingConverter implements InvocationHandlerConverter<ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>> {

    public constructor(private readonly log: Logger = LoggerFactory.getLogger("ServerStreamingConverter")) {}

    public convert(baseHandler: ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>): BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> {
        return {
            methodId: baseHandler.methodId,
            handle: (invocationContext: MethodInvocationContext, invocationHostClient: StreamingInvocationClient<ArrayBuffer>) => {
                return {
                    next: (request) => {
                        try {
                            baseHandler.handle(invocationContext, request, invocationHostClient);
                        } catch (executionError) {
                            this.log.error("Execution error", executionError);
                            invocationHostClient.error(ClientDtoUtils.toError(executionError));
                        }
                    },
                    streamCompleted: () => this.log.debug("Messages stream completed"),
                    error: e => this.log.error("Error received", e),
                    complete: () => this.log.debug("Invocation completed")
                };
            }
        };
    }
}