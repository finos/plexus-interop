import { EventBus } from "../bus/EventBus";
import { Logger, LoggerFactory, DomUtils } from "@plexus-interop/common";
import { CrossDomainEventBus } from "../bus/cross/CrossDomainEventBus";

export class CrossDomainEventBusProvider {

    private readonly log: Logger = LoggerFactory.getLogger("CrossDomainEventBusProvider");

    public constructor(private readonly proxyUrlProvider: () => Promise<string>) { }

    public async connect(): Promise<EventBus> {

        this.log.info("Resolving Proxy Iframe URL");
        const proxyIframeUrl = await this.proxyUrlProvider();

        this.log.info(`Initialyzing proxy iFrame with url [${proxyIframeUrl}]`);
        const proxyiFrame = await DomUtils.createHiddenIFrame("plexus-proxy-iframe", proxyIframeUrl);

        this.log.info("Initialyzing Event Bus");
        const crossDomainBus: CrossDomainEventBus = new CrossDomainEventBus(proxyiFrame, DomUtils.getOrigin(proxyIframeUrl));
        await crossDomainBus.init();
        return crossDomainBus;
        
    }

}