
import { TransportConnectionProvider } from "./TransportConnectionProvider";
import { Injectable } from "@angular/core";
import { CrossDomainEventBus, WebBrokerConnectionBuilder } from "@plexus-interop/broker";
import { TransportConnection } from "@plexus-interop/transport-common";

@Injectable()
export class TransportConnectionFactory {

    public createWebTransportProvider(baseUrl: string, appRegistryProvider:): TransportConnectionProvider {
        return async () => {
            let eventBus: CrossDomainEventBus;
            const connection: TransportConnection = await new WebBrokerConnectionBuilder()
                .withAppRegistryProviderFactory(async () => new JsonAppRegistryProvider(RawMetadata.appsJson))
                .withInteropRegistryProviderFactory(async () => new JsonInteropRegistryProvider(RawMetadata.interopJson))
                .withEventBusProvider(async () => {
                    eventBus = await new CrossDomainEventBusProvider(async () => proxyUrl).connect() as CrossDomainEventBus;
                    return eventBus;
                })
                .connect();
            return connection;
        }
    }

}