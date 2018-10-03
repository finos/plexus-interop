/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
    '@plexus-interop/metadata';

@Injectable()
export class InteropServiceFactory {

    public async getInteropRegistryService(metadataUrl: string): Promise<InteropRegistryService> {
        const provider = await this.createInteropRegistryProvider(metadataUrl);
        return new InteropRegistryService(provider);
    }

    public async getAppRegistryService(appsUrl: string): Promise<AppRegistryService> {
        const provider = await this.createAppRegistryProvider(appsUrl);
        return new AppRegistryService(provider);
    }

    public async createInteropRegistryProvider(metadataUrl: string): Promise<InteropRegistryProvider> {
        const provider = new UrlInteropRegistryProvider(metadataUrl);
        await provider.start();
        return provider;
    }

    public async createAppRegistryProvider(appsUrl: string): Promise<AppRegistryProvider> {
        const provider = new UrlAppRegistryProvider(appsUrl);
        await provider.start();
        return provider;
    }
}