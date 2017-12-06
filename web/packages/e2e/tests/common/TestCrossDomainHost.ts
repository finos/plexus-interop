import { Logger, LoggerFactory } from "@plexus-interop/common";
import { CrossDomainHostBuilder, JStorageEventBus } from "@plexus-interop/broker";

export class TestCrossDomainHost {

    public start(): void {
        const logger: Logger = LoggerFactory.getLogger("CrossDomainHostPage");
        new CrossDomainHostBuilder()
            .withEventBus(new JStorageEventBus())
            .withCrossDomainConfig({ whiteListedUrls: ["*"] })
            .build()
            .then(() => logger.info("Created"))
            .catch(e => logger.error("Failed", e));
    }

}
const globalObject: any = window || global;
// tslint:disable-next-line:no-string-literal
const host = globalObject["proxyHostVar"] = new TestCrossDomainHost();

host.start();
