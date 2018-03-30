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
import { GenericClientApiBuilder, GenericClientApi } from "../generic";
import { ConnectionDetailsService } from "./ConnectionDetailsService";
import { DefaultConnectionDetailsService } from "./DefaultConnectionDetailsService";
import { UniqueId } from "@plexus-interop/transport-common";
import { WebSocketConnectionFactory } from "@plexus-interop/websocket-transport";

export class ContainerAwareClientAPIBuilder extends GenericClientApiBuilder {

    public constructor(private readonly connectionDetailsService: ConnectionDetailsService = new DefaultConnectionDetailsService()) {
        super();
    }

    public async connect(): Promise<GenericClientApi> {
        if (!this.applicationInstanceId || !this.transportConnectionProvider) {
            try {
                const details = await this.connectionDetailsService.getConnectionDetails();
                if (!this.applicationInstanceId && details.appInstanceId) {
                    this.log.info("Using App instance ID from container");
                    this.applicationInstanceId = UniqueId.fromString(details.appInstanceId);
                }
                if (!this.transportConnectionProvider && (details.ws && details.ws.port)) {
                    this.log.info("Transport connection provider from container");
                    this.transportConnectionProvider = () => new WebSocketConnectionFactory(new WebSocket(`ws://localhost:${details.ws.port}`)).connect();
                }
            } catch (e) {
                this.log.info("Failed to discover container connection details", e);
            }
        }
        return super.connect();
    }

}