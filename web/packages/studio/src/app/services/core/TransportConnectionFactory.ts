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
import { TransportConnectionProvider } from './TransportConnectionProvider';
import { Injectable } from '@angular/core';
import { CrossDomainEventBus, WebBrokerConnectionBuilder, CrossDomainEventBusProvider, BroadCastChannelEventBus, EventBus } from '@plexus-interop/broker';
import { TransportConnection } from '@plexus-interop/transport-common';
import { InteropServiceFactory } from './InteropServiceFactory';
import { WebSocketConnectionFactory } from '@plexus-interop/websocket-transport';
import { LoggerFactory } from '@plexus-interop/common';
import { StudioExtensions } from '../extensions/StudioExtensions';
import { TransportType, ConnectionDetails } from '../ui/AppModel';

@Injectable()
export class TransportConnectionFactory {

    private readonly serviceFactory: InteropServiceFactory = new InteropServiceFactory();
    private readonly log = LoggerFactory.getLogger('TransportConnectionFactory');

    public async getConnectionProvider(connectionDetails: ConnectionDetails): Promise<TransportConnectionProvider> {
        return StudioExtensions
            .getConnectionProvider()
            .then(cp => {
                this.log.info('Received Connection Provider from Studio Extension');
                return cp;
            })
            .catch(() => {
                this.log.debug('Could\'t get connection from extension');
                return this.lookupProviderFromConnectionDetails(connectionDetails);
            });
    }

    private createCrossDomainWebTransportProvider(connectionDetails: ConnectionDetails): TransportConnectionProvider {
        if (!connectionDetails.webConfig
            || !connectionDetails.webConfig.proxyHostUrl
            || !connectionDetails.webConfig.appsMetadataUrl
            || !connectionDetails.generalConfig.metadataUrl) {
            throw new Error('Proxy Host/Metadata/Apps URLs are mandatory');
        }
        return this.createWebTransportProvider(
            connectionDetails.webConfig.appsMetadataUrl,
            connectionDetails.generalConfig.metadataUrl,
            async () => {
                const eventBus = await new CrossDomainEventBusProvider(
                    async () => connectionDetails.webConfig.proxyHostUrl)
                    .connect() as CrossDomainEventBus;
                return eventBus;
            }
        );
    }

    private async lookupProviderFromConnectionDetails(connectionDetails: ConnectionDetails): Promise<TransportConnectionProvider> {
        const transport = connectionDetails.generalConfig.transportType;
        switch (transport) {
            case TransportType.NATIVE_WS:
                this.log.info('Connecting to Native WS Transport');
                return this.createWebSocketTransportProvider(connectionDetails);
            case TransportType.WEB_SAME_BROADCAST:
                this.log.info('Connecting to Same Domain Broad Cast Transport');
                return this.createSameOriginWebTransportProvider(connectionDetails);
            case TransportType.WEB_CROSS:
                this.log.info('Connecting to Cross Domain Transport');
                return this.createCrossDomainWebTransportProvider(connectionDetails);
            default:
                throw new Error(`Unsupported Transport Type: ${transport}`);
        }
    }

    private createSameOriginWebTransportProvider(connectionDetails: ConnectionDetails): TransportConnectionProvider {
        if (!connectionDetails.webConfig
            || !connectionDetails.webConfig.appsMetadataUrl
            || !connectionDetails.generalConfig.metadataUrl) {
            throw new Error('Proxy Host/Metadata/Apps URLs are mandatory');
        }
        return this.createWebTransportProvider(
            connectionDetails.webConfig.appsMetadataUrl,
            connectionDetails.generalConfig.metadataUrl, async () => new BroadCastChannelEventBus().init());
    }

    private createWebTransportProvider(appsUrl: string, metadataUrl: string, eventBusProvider: () => Promise<EventBus>): TransportConnectionProvider {
        return async () => {
            const connection: TransportConnection = await new WebBrokerConnectionBuilder()
                .withAppRegistryProviderFactory(async () => this.serviceFactory.createAppRegistryProvider(appsUrl))
                .withInteropRegistryProviderFactory(async () => this.serviceFactory.createInteropRegistryProvider(metadataUrl))
                .withEventBusProvider(eventBusProvider)
                .connect();
            return connection;
        };
    }

    private createWebSocketTransportProvider(connectionDetails: ConnectionDetails): TransportConnectionProvider {
        if (!connectionDetails.wsConfig || !connectionDetails.wsConfig.wsUrl) {
            throw new Error('Web Socket URL not provided');
        }
        return () => new WebSocketConnectionFactory(new WebSocket(connectionDetails.wsConfig.wsUrl)).connect();
    }

}