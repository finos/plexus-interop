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
import { InteropPlatform } from './api';
import { InteropFeature, MethodImplementation, StreamImplementation, InteropPeer } from './api/client-api';
import { InteropRegistryService } from '@plexus-interop/metadata';
import { BinaryMarshallerProvider } from '@plexus-interop/io';
import { TransportConnection } from '@plexus-interop/transport-common';
import { GenericClientApiBuilder } from '@plexus-interop/client';
import { PlexusInteropPeer } from './PlexusInteropPeer';
import { registerMethod, registerStream } from './registration';

export class PlexusInteropPlatform implements InteropPlatform {

    public readonly type: string = 'Plexus Interop';
    public readonly version: string = '0.0.1';

    public constructor(
        private readonly registryService: InteropRegistryService,
        private readonly marshallerProvider: BinaryMarshallerProvider,
        private readonly connectionProvider: () => Promise<TransportConnection>
    ) { }

    public isFeatureSupported(feature: InteropFeature): boolean {
        switch (feature) {
            case InteropFeature.DiscoverMethods:
            case InteropFeature.DiscoverStreams:
            case InteropFeature.RegisterMethodOnConnect:
            case InteropFeature.RegisterStreamOnConnect:
            case InteropFeature.InvokeMethod:
            case InteropFeature.SubscribeStream:
                return true;
            default:
                return false;
        }
    }

    public async connect(applicationName: string, apiMetadata?: string, methods?: MethodImplementation[], streams?: StreamImplementation[]): Promise<InteropPeer> {
        const hostAppMetadata = this.registryService.getApplication(applicationName);
        const clientBuilder = new GenericClientApiBuilder(this.marshallerProvider)
            .withApplicationId(hostAppMetadata.id)
            .withTransportConnectionProvider(this.connectionProvider);
        methods = methods || [];
        methods.forEach(method => registerMethod(method, clientBuilder, this.registryService));
        streams = streams || [];
        streams.forEach(stream => registerStream(stream, clientBuilder, this.registryService));
        const genericClient = await clientBuilder.connect();
        return new PlexusInteropPeer(genericClient, this.registryService, hostAppMetadata);
    }

}
