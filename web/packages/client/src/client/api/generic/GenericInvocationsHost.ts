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
import { GenericClient } from "../../../client/generic/GenericClient";
import { InvocationMetaInfo } from "@plexus-interop/protocol";
import { ClientDtoUtils } from "../../ClientDtoUtils";
import { Invocation } from "../../../client/generic/Invocation";
import { BidiStreamingInvocationHandler } from "../streaming/BidiStreamingInvocationHandler";
import { StreamingInvocationHost } from "../streaming/StreamingInvocationHost";
import { GenericBidiStreamingInvocationHandler } from "./GenericBidiStreamingInvocationHandler";
import { GenericUnaryInvocationHandler } from "./GenericUnaryInvocationHandler";
import { GenericServerStreamingInvocationHandler } from "./GenericServerStreamingInvocationHandler";
import { UnaryHandlerConverter } from "../unary/UnaryHandlerConverter";
import { ServerStreamingConverter } from "../streaming/ServerStreamingHandlerConveter";
import { Logger, LoggerFactory } from "@plexus-interop/common";

export class GenericInvocationsHost {

    private log: Logger = LoggerFactory.getLogger("GenericInvocationHost");

    // tslint:disable-next-line:typedef
    public readonly handlersRegistry = new Map<String, BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>>();

    constructor(
        sourceApplicationId: string,
        private readonly genericClient: GenericClient,
        private bidiStreamingHandlers: GenericBidiStreamingInvocationHandler[],
        private unaryHandlers: GenericUnaryInvocationHandler[] = [],
        private serverStreamingHandlers: GenericServerStreamingInvocationHandler[] = []) {
        this.registerHandlers();
    }

    public start(): Promise<void> {
        return this.genericClient.acceptInvocations({
            next: (invocation: Invocation) => this.handleInvocation(invocation),
            error: (e) => this.log.error("Error on invocations subscription", e),
            complete: () => this.log.debug("Invocations subscription completed")
        })
            .then(() => this.log.debug("Started to listen invocations"))
            .catch((e) => {
                this.log.error("Error on opening invocations subscription", e);
                throw e;
            });
    }
    
    private registerHandlers(): void {
        this.unaryHandlers.forEach(unaryHandler =>
            this.bidiStreamingHandlers.push({
                serviceInfo: unaryHandler.serviceInfo,
                handler: new UnaryHandlerConverter(this.log).convert(unaryHandler.handler)
            }));
        this.serverStreamingHandlers.forEach(serverStreamingHandler =>
            this.bidiStreamingHandlers.push({
                serviceInfo: serverStreamingHandler.serviceInfo,
                handler: new ServerStreamingConverter(this.log).convert(serverStreamingHandler.handler)
            }));
        this.bidiStreamingHandlers.forEach((serviceHandler) => {
            const invocationInfo: InvocationMetaInfo = {
                serviceId: serviceHandler.serviceInfo.serviceId,
                serviceAlias: serviceHandler.serviceInfo.serviceAlias,
                methodId: serviceHandler.handler.methodId
            };
            const hash = ClientDtoUtils.targetInvocationHash(invocationInfo);
            this.log.trace(`Registering handler for ${hash}`);
            this.handlersRegistry.set(hash, serviceHandler.handler);
        });
    }

    private handleInvocation(invocation: Invocation): void {
        this.log.trace(`Received invocation`);
        new StreamingInvocationHost(this.handlersRegistry, invocation).execute();
    }

}