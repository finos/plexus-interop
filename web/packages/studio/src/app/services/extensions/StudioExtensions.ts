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
import { TransportConnectionProvider } from '../transport/TransportConnectionProvider';

export class StudioExtensions {

    private static connectionProvider?: TransportConnectionProvider;
    private static proxyHostUrlProvider?: () => Promise<string>;
    private static metadataUrlProvider?: () => Promise<string>;

    public static setMetadataUrlProvider(provider: () => Promise<string>): void {
        StudioExtensions.metadataUrlProvider = provider;
    }

    public static setConnectionProvider(connectionProvider: TransportConnectionProvider): void {
        StudioExtensions.connectionProvider = connectionProvider;
    }

    public static setProxyHostUrlProvider(provider: () => Promise<string>): void {
        StudioExtensions.proxyHostUrlProvider = provider;
    }

    public static async getConnectionProvider(): Promise<TransportConnectionProvider> {
        return StudioExtensions.connectionProvider || Promise.reject('Not provided');
    }

    public static async getProxyHostUrl(): Promise<string> {
        return StudioExtensions.proxyHostUrlProvider ? StudioExtensions.proxyHostUrlProvider() : Promise.reject('Not provider');
    }

    public static async getMetadataUrl(): Promise<string> {
        return StudioExtensions.metadataUrlProvider ? StudioExtensions.metadataUrlProvider() : Promise.reject('Not provided');
    }

}