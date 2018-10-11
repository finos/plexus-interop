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
import { GenericClientApiBuilder, MethodInvocationContext, StreamingInvocationClient } from '@plexus-interop/client';
import { PlexusInteropPeer } from './PlexusInteropPeer';
import { getProvidedMethodByAlias, getAppAliasById } from './metadata';
import { PartialPeerDescriptor } from './PartialPeerDescriptor';
import { ClientError } from '@plexus-interop/protocol';

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

function registerMethod(commonApiMethod: MethodImplementation, clientBuilder: GenericClientApiBuilder, registryService: InteropRegistryService): void {
    const providedMethod = getProvidedMethodByAlias(commonApiMethod.name, registryService);
    const requestType = providedMethod.method.requestMessage.id;
    const responseType = providedMethod.method.responseMessage.id;
    clientBuilder.withTypeAwareUnaryHandler({
        serviceInfo: {
            serviceId: providedMethod.providedService.service.id,
            serviceAlias: providedMethod.providedService.alias
        },
        methodId: providedMethod.method.name,
        handle: async (invocationContext: MethodInvocationContext, request: any): Promise<any> => {
            const appId = invocationContext.consumerApplicationId;
            const response = await commonApiMethod.onInvoke(request, new PartialPeerDescriptor(
                getAppAliasById(appId, registryService) || appId,
                appId
            ));
            return response;
        }
    }, requestType, responseType);
}

function registerStream(commonApiStream: StreamImplementation, clientBuilder: GenericClientApiBuilder, registryService: InteropRegistryService): void {
    const providedMethod = getProvidedMethodByAlias(commonApiStream.name, registryService);
    const requestType = providedMethod.method.requestMessage.id;
    const responseType = providedMethod.method.responseMessage.id;
    clientBuilder.withTypeAwareServerStreamingHandler({
        serviceInfo: {
            serviceId: providedMethod.providedService.service.id,
            serviceAlias: providedMethod.providedService.alias
        },
        methodId: providedMethod.method.name,
        handle: (invocationContext: MethodInvocationContext, request: any, invocationHostClient: StreamingInvocationClient<any>): void => {
            const appId = invocationContext.consumerApplicationId;
            const consumerPeer = new PartialPeerDescriptor(
                getAppAliasById(appId, registryService) || appId,
                appId
            );
            commonApiStream.onSubscriptionRequested({
                next: async v => invocationHostClient.next(v),
                error: async e => invocationHostClient.error(new ClientError(e.message, e.stack)),
                completed: async () => invocationHostClient.complete()
            }, consumerPeer, request)
                .then(subscription => {
                    invocationContext.cancellationToken.onCancel(() => subscription.unsubscribe());
                })
                .catch(e => invocationHostClient.error(new ClientError(e.message, e.stack)));
        }
    }, requestType, responseType);
}