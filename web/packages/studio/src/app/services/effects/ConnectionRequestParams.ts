import { UrlParamsProvider } from "@plexus-interop/common";

export class ConnectionRequestParams {
    
    public getWsUrl(): string {
        return UrlParamsProvider.getParam('wsUrl');
    }

    public getHostProxyUrl(): string {
        return UrlParamsProvider.getParam('hostProxyUrl');
    }

    public getMetadataUrl(): string {
        return UrlParamsProvider.getParam('metadataUrl');
    }

    public getAppsUrl(): string {
        return UrlParamsProvider.getParam('appsUrl');
    }

}