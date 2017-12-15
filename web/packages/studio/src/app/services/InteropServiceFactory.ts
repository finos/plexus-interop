
import { Injectable } from "@angular/core";
import { InteropRegistryService, UrlInteropRegistryProvider, AppRegistryService, UrlAppRegistryProvider } from "@plexus-interop/broker";

@Injectable()
export class InteropServiceFactory {

    public async getInteropRegistryService(url: string): Promise<InteropRegistryService> {
        const provider = new UrlInteropRegistryProvider(url);
        await provider.start();
        return new InteropRegistryService(provider);
    }

    public async getAppRegistryService(url: string): Promise<AppRegistryService> {
        const provider = new UrlAppRegistryProvider(url);
        await provider.start();
        return new AppRegistryService(provider);
    }

}