
import { TransportConnectionProvider } from "./TransportConnectionProvider";
import { Injectable } from "@angular/core";
import { CrossDomainEventBus, WebBrokerConnectionBuilder, CrossDomainEventBusProvider } from "@plexus-interop/broker";
import { TransportConnection } from "@plexus-interop/transport-common";
import { InteropServiceFactory } from "./InteropServiceFactory";
import { UrlResolver } from "./UrlResolver";

@Injectable()
export class TransportConnectionFactory {

    private readonly serviceFactory: InteropServiceFactory = new InteropServiceFactory();
    private readonly urlResolver: UrlResolver = new UrlResolver();

    public createWebTransportProvider(baseUrl: string): TransportConnectionProvider {
        return async () => {
            let eventBus: CrossDomainEventBus;
            const connection: TransportConnection = await new WebBrokerConnectionBuilder()
                .withAppRegistryProviderFactory(async () => this.serviceFactory.createAppRegistryProvider(baseUrl))
                .withInteropRegistryProviderFactory(async () => this.serviceFactory.createInteropRegistryProvider(baseUrl))
                .withEventBusProvider(async () => {
                    eventBus = await new CrossDomainEventBusProvider(
                        async () => this.urlResolver.getProxyHostUrl(baseUrl))
                        .connect() as CrossDomainEventBus;
                    return eventBus;
                })
                .connect();
            return connection;
        };
    }

}