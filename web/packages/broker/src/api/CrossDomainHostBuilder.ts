import { EventBus } from "../bus/EventBus";
import { CrossDomainHost } from "../bus/cross/host/CrossDomainHost";
import { CrossDomainHostConfig } from "../bus/cross/host/CrossDomainHostConfig";

export class CrossDomainHostBuilder {

    private eventBus: EventBus;

    private crossDomainConfig: CrossDomainHostConfig;

    public withEventBus(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    public withCrossDomainConfig(crossDomainConfig: CrossDomainHostConfig) {
        this.crossDomainConfig = crossDomainConfig;
    }

    public async build(): Promise<CrossDomainHost> {
        const crossDomainHost = new CrossDomainHost(this.eventBus, this.crossDomainConfig);
        await crossDomainHost.connect();
        return crossDomainHost;
    }

}