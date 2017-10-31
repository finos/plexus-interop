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
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { ServerConnectionFactory } from "@plexus-interop/transport-common";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { ClientConnectionProcessor } from "./ClientConnectionProcessor";
import { AuthenticationHandler } from "./AuthenticationHandler";
import { InvocationRequestHandler } from "./InvocationRequestHandler";
import { RegistryProvider } from "../metadata/RegistryProvider";
import { RegistryService } from "../metadata/RegistryService";
import { ClientRequestProcessor } from "./ClientRequestProcessor";

export class Broker {

    private readonly log: Logger = LoggerFactory.getLogger("Broker");

    private readonly connectionProcessor: ClientConnectionProcessor;

    constructor(
        private appLifeCycleManager: AppLifeCycleManager,
        private connectionFactory: ServerConnectionFactory,
        private registryProvider: RegistryProvider
    ) {
        const authHandler = new AuthenticationHandler(this.appLifeCycleManager);
        const registryService = new RegistryService(this.registryProvider);
        const invocationRequestHandler = new InvocationRequestHandler(registryService, this.appLifeCycleManager);
        const clientRequestProcessor = new ClientRequestProcessor(invocationRequestHandler);
        this.connectionProcessor = new ClientConnectionProcessor(authHandler, clientRequestProcessor, this.appLifeCycleManager);
        this.log.trace("Created");
        this.start();
    }

    private start(): void {
        this.log.debug("Starting to listen for incoming connections");
        this.connectionFactory.acceptConnections({
            next: connection => {
                if (this.log.isDebugEnabled()) {
                    this.log.debug(`Accepted new connection [${connection.uuid().toString()}]`);
                }
                this.connectionProcessor.handle(connection);
            },
            error: e => this.log.error("Error on receiving new connection", e),
            complete: () => this.log.info("No more connections")
        });
    }

}