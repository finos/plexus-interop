/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TransportConnectionProvider } from './TransportConnectionProvider';
import { Injectable } from '@angular/core';
import { CrossDomainEventBus, WebBrokerConnectionBuilder, CrossDomainEventBusProvider, BroadCastChannelEventBus, EventBus } from '@plexus-interop/broker';
import { TransportConnection } from '@plexus-interop/transport-common';
import { InteropServiceFactory } from './InteropServiceFactory';
import { UrlResolver } from './UrlResolver';
import { WebSocketConnectionFactory } from '@plexus-interop/websocket-transport';
import { UrlParamsProvider, LoggerFactory } from '@plexus-interop/common';
import { StudioExtensions } from '../extensions/StudioExtensions';
import { TransportType } from './TransportType';

@Injectable()
export class TransportConnectionFactory {

    private readonly serviceFactory: InteropServiceFactory = new InteropServiceFactory();
    private readonly urlResolver: UrlResolver = new UrlResolver();
    private readonly log = LoggerFactory.getLogger('TransportConnectionFactory');

    public async getConnectionProvider(baseUrl: string): Promise<TransportConnectionProvider> {
        return StudioExtensions
            .getConnectionProvider()
            .then(cp => {
                this.log.info('Received Connection Provider from extension');
                return cp;
            })
            .catch(() => {
                this.log.debug('Could\'t get connection from extension');
                return this.lookupProviderFromRequestParams(baseUrl);
            });
    }

    private async lookupProviderFromRequestParams(baseUrl: string): Promise<TransportConnectionProvider> {
        const wsUrl = UrlParamsProvider.getParam('wsUrl');
        const transport = UrlParamsProvider.getParam('transport');
        switch (transport) {
            case TransportType.NATIVE_WS:
                const wsUrl = UrlParamsProvider.getParam('wsUrl');
                this.log.info('Connecting to Native WS Transport');                        
                return this.createWebSocketTransportProvider(wsUrl);
            case TransportType.WEB_SAME_BROADCAST:
                this.log.info('Connecting to Same Domain Broad Cast Transport');
                return this.createSameOriginWebTransportProvider(baseUrl);
            default:
                this.log.info('Connecting to Cross Domain Transport');                    
                return this.createCrossDomainWebTransportProvider(baseUrl);
        }
    }

    private createCrossDomainWebTransportProvider(baseUrl: string): TransportConnectionProvider {
        return this.createWebTransportProvider(baseUrl, async () => {
            const eventBus = await new CrossDomainEventBusProvider(
                () => this.getProxyHostUrl(baseUrl))
                .connect() as CrossDomainEventBus;
            return eventBus;
        });
    }

    private async getProxyHostUrl(baseUrl: string): Promise<string> {
        return StudioExtensions.getProxyHostUrl()
            .catch(e => {
                this.log.debug('Proxy Host Extension is not provided');
                return UrlParamsProvider.getParam('hostProxyUrl') || this.urlResolver.getProxyHostUrl(baseUrl)                
            });
    }

    private createSameOriginWebTransportProvider(baseUrl: string): TransportConnectionProvider {
        return this.createWebTransportProvider(baseUrl, async () => new BroadCastChannelEventBus().init());
    }

    private createWebTransportProvider(baseUrl: string, eventBusProvider: () => Promise<EventBus>): TransportConnectionProvider {
        return async () => {
            let eventBus: CrossDomainEventBus;
            const connection: TransportConnection = await new WebBrokerConnectionBuilder()
                .withAppRegistryProviderFactory(async () => this.serviceFactory.createAppRegistryProvider(baseUrl))
                .withInteropRegistryProviderFactory(async () => this.serviceFactory.createInteropRegistryProvider(baseUrl))
                .withEventBusProvider(eventBusProvider)
                .connect();
            return connection;
        };
    }

    private createWebSocketTransportProvider(wsUrl: string): TransportConnectionProvider {
        return () => new WebSocketConnectionFactory(new WebSocket(wsUrl)).connect();
    }

}