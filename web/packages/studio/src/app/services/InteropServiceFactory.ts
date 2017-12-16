import { Injectable } from "@angular/core";
import { InteropRegistryService, UrlInteropRegistryProvider, AppRegistryService, UrlAppRegistryProvider, AppRegistryProvider, InteropRegistryProvider } from "@plexus-interop/broker";
import { UrlResolver } from "./UrlResolver";

export interface RegistryUrls {
    apps: string,
    interop: string
}

@Injectable()
export class InteropServiceFactory {
    private readonly urlResolver: UrlResolver = new UrlResolver();

    public async getInteropRegistryService(baseUrl: string): Promise<InteropRegistryService> {
        const provider = await this.createInteropRegistryProvider(baseUrl);

        return new InteropRegistryService(provider);
    }

    public async getAppRegistryService(baseUrl: string): Promise<AppRegistryService> {
        const provider = await this.createAppRegistryProvider(baseUrl);

        return new AppRegistryService(provider);
    }

    public getMetadataUrls(baseUrl: string): RegistryUrls {
        return {
            apps: this.urlResolver.getAppMetadataUrl(baseUrl),
            interop: this.urlResolver.getInteropMetadataUrl(baseUrl)
        }
    }

    public async createInteropRegistryProvider(baseUrl: string): Promise<InteropRegistryProvider> {
        baseUrl = this.urlResolver.getInteropMetadataUrl(baseUrl);
        const provider = new UrlInteropRegistryProvider(baseUrl, 10000);
        await provider.start();
        return provider;
    }

    public async createAppRegistryProvider(baseUrl: string): Promise<AppRegistryProvider> {
        baseUrl = this.urlResolver.getAppMetadataUrl(baseUrl);
        const provider = new UrlAppRegistryProvider(baseUrl, 10000);
        await provider.start();
        return provider;
    }
}