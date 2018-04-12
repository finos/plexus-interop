/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Injectable } from '@angular/core';
import { InteropRegistryService, UrlInteropRegistryProvider, AppRegistryService, UrlAppRegistryProvider, AppRegistryProvider, InteropRegistryProvider } from
    '@plexus-interop/broker';
import { UrlResolver } from './UrlResolver';

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