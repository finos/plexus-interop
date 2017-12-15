import { Injectable } from "@angular/core";
import { InteropRegistryService, UrlInteropRegistryProvider, AppRegistryService, UrlAppRegistryProvider } from "@plexus-interop/broker";

const APP_REGISTY_FILE_NAME = 'apps.json';
const INTEROP_REGISTY_FILE_NAME = 'interop.json';

@Injectable()
export class InteropServiceFactory {    
    public async getInteropRegistryService(baseUrl: string): Promise<InteropRegistryService> {
        const url = baseUrl + INTEROP_REGISTY_FILE_NAME;

        const provider = new UrlInteropRegistryProvider(url);
        await provider.start();
        return new InteropRegistryService(provider);
    }

    public async getAppRegistryService(baseUrl: string): Promise<AppRegistryService> {
        const url = baseUrl + APP_REGISTY_FILE_NAME;

        const provider = new UrlAppRegistryProvider(url);
        await provider.start();
        return new AppRegistryService(provider);
    }

}