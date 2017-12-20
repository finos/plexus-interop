
import { TransportConnectionProvider } from "./TransportConnectionProvider";
import { Injectable } from "@angular/core";
import { CrossDomainEventBus, WebBrokerConnectionBuilder, CrossDomainEventBusProvider } from "@plexus-interop/broker";
import { TransportConnection } from "@plexus-interop/transport-common";
import { InteropServiceFactory } from "../client/InteropServiceFactory";
import { UrlResolver } from "../UrlResolver";
import { WebSocketConnectionFactory } from "@plexus-interop/websocket-transport";
import { DomUtils } from "@plexus-interop/common";

@Injectable()
export class TransportConnectionFactory {

    private readonly serviceFactory: InteropServiceFactory = new InteropServiceFactory();
    private readonly urlResolver: UrlResolver = new UrlResolver();

    public createWebTransportProvider(baseUrl: string): TransportConnectionProvider {
        return async () => {
            let eventBus: CrossDomainEventBus;
            const proxyHostUrl = this.urlResolver.getProxyHostUrl(baseUrl);
            const iFrameId = "plexus-" + DomUtils.getOrigin(proxyHostUrl).replace(/\.\/\:/g, "-");

            const connection: TransportConnection = await new WebBrokerConnectionBuilder()
                .withAppRegistryProviderFactory(async () => this.serviceFactory.createAppRegistryProvider(baseUrl))
                .withInteropRegistryProviderFactory(async () => this.serviceFactory.createInteropRegistryProvider(baseUrl))
                .withEventBusProvider(async () => {
                    eventBus = await new CrossDomainEventBusProvider(
                        async () => proxyHostUrl, iFrameId)
                        .connect() as CrossDomainEventBus;
                    return eventBus;
                })
                .connect();
            return connection;
        };
    }

    public createWebSocketTransportProvider(wsUrl: string): TransportConnectionProvider {
        return () => new WebSocketConnectionFactory(new WebSocket(wsUrl)).connect();
    }

}