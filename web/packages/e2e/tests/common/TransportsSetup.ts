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
import { WebSocketConnectionFactory } from "@plexus-interop/websocket-transport";
import { ConnectionProvider } from "./ConnectionProvider";
import { WebBrokerConnectionBuilder, EventBus } from "@plexus-interop/broker";
import { CrossDomainEventBusProvider, CrossDomainEventBus, JsonAppRegistryProvider, JsonInteropRegistryProvider } from "@plexus-interop/broker";
import { TransportConnection } from "@plexus-interop/transport-common";
import { RawMetadata } from "./RawMetadata";

export class TransportsSetup {

    public createWebSocketTransportProvider(url: string): ConnectionProvider {
        return async () => {
            const socket = new WebSocket(url);
            const connection = await new WebSocketConnectionFactory(socket).connect();
            return {
                getConnection: () => connection,
                dropConnection: () => socket.close()
            };
        };
    }

    public createCrossDomainTransportProvider(proxyUrl: string): ConnectionProvider {
        const eventBusProvider = async () => new CrossDomainEventBusProvider(async () => proxyUrl).connect();
        return this.createWebBrokerTransportProvider(eventBusProvider);
    }

    public createWebBrokerTransportProvider(eventBusProvider: () => Promise<EventBus>): ConnectionProvider {
        return async () => {
            let eventBus: CrossDomainEventBus;
            const connection: TransportConnection = await new WebBrokerConnectionBuilder()
                .withAppRegistryProviderFactory(async () => new JsonAppRegistryProvider(RawMetadata.appsJson))
                .withInteropRegistryProviderFactory(async () => new JsonInteropRegistryProvider(RawMetadata.interopJson))
                .withEventBusProvider(eventBusProvider)
                .connect();
            return {
                getConnection: () => connection,
                dropConnection: () => eventBus.disconnect().catch(e => console.error("Failed to disconnect", e))
            };
        }
    }

}