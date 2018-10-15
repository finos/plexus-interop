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
import { InteropPlatform } from '.';
import { WebSocketConnectionFactory } from '@plexus-interop/websocket-transport';
import { UrlInteropRegistryProvider, InteropRegistryService } from '@plexus-interop/metadata';
import { DynamicBinaryMarshallerProvider } from '@plexus-interop/io/dist/main/src/dynamic';
import { PlexusInteropPlatform } from '../PlexusInteropPlatform';
import { webSocketCtor } from '@plexus-interop/common/dist/main/src/ws/detect';
import { WebSocketDataProvider } from '@plexus-interop/remote';

export interface InteropPlatformConfig {
    webSocketUrl: string;
}

export class InteropPlatformFactory {

    public async createPlatform(config: InteropPlatformConfig): Promise<InteropPlatform> {
        const wsCtor = webSocketCtor();
        const metadataWsUrl = `${config.webSocketUrl}/metadata/interop`;
        const connectionProvider = async () => new WebSocketConnectionFactory(new wsCtor(config.webSocketUrl)).connect();
        const interopProvider = new UrlInteropRegistryProvider(metadataWsUrl, -1, new WebSocketDataProvider(webSocketCtor()));
        await interopProvider.start();
        const marshallerProvider = new DynamicBinaryMarshallerProvider(interopProvider.getCurrent());
        return new PlexusInteropPlatform(new InteropRegistryService(interopProvider), marshallerProvider, connectionProvider);
    }

}