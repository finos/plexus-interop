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
import { AppLifeCycleManager } from '../lifecycle/AppLifeCycleManager';
import { AppRegistryService } from '../metadata/apps/AppRegistryService';
import { InteropRegistryService } from '../metadata/interop/InteropRegistryService';
import { MethodDiscoveryRequest } from '@plexus-interop/client-api';
import { TransportChannel } from '@plexus-interop/transport-common';
import { ApplicationConnection } from '../lifecycle/ApplicationConnection';
import { clientProtocol, ErrorCompletion, ClientError, UniqueId, ClientProtocolHelper } from '@plexus-interop/protocol';
import { Logger, LoggerFactory, ExtendedArray } from '@plexus-interop/common';
import { ProvidedMethod } from '../metadata/interop/model/ProvidedMethod';
import { DiscoveredMethod, MethodType } from '@plexus-interop/client';

export class DiscoveryRequestHandler {

    private readonly log: Logger = LoggerFactory.getLogger('DiscoveryRequestHandler');

    public constructor(
        private readonly appLifeCycleManager: AppLifeCycleManager,
        readonly appRegistryService: AppRegistryService,
        private readonly interopRegistryService: InteropRegistryService
    ) { }

    public async handleMethodDiscovery(
        methodDiscoveryRequest: MethodDiscoveryRequest,
        sourceChannel: TransportChannel,
        sourceConnection: ApplicationConnection): Promise<void> {

        const appId = sourceConnection.descriptor.applicationId;

        this.log.info(`Handling method discovery from ${appId}`);

        if (this.log.isTraceEnabled()) {
            this.log.trace(`Method discovery request`, methodDiscoveryRequest);
        }

        try {

            const appMetadata = this.interopRegistryService.getApplication(appId);

            let providedMethods: ProvidedMethod[] = methodDiscoveryRequest.consumedMethod ?
                this.interopRegistryService
                    .getMatchingProvidedMethods(sourceConnection.descriptor.applicationId, methodDiscoveryRequest.consumedMethod)
                : this.interopRegistryService.getMatchingProvidedMethodsForApp(appMetadata);

            if (methodDiscoveryRequest.inputMessageId) {
                providedMethods = providedMethods.filter(m => m.method.requestMessage.id === methodDiscoveryRequest.inputMessageId);
            }

            if (methodDiscoveryRequest.outputMessageId) {
                providedMethods = providedMethods.filter(m => methodDiscoveryRequest.outputMessageId === methodDiscoveryRequest.outputMessageId);
            }

            let discoveredMethods: DiscoveredMethod[];

            if (clientProtocol.interop.protocol.DiscoveryMode.Online
                === methodDiscoveryRequest.discoveryMode) {

                const connectedApps = await this.appLifeCycleManager.getOnlineConnections();

                this.log.trace(`Handling online discovery, ${connectedApps.length} apps connected`);

                discoveredMethods = ExtendedArray.of(providedMethods)
                    .joinWith(connectedApps, (providedMethod, app) => {
                        // join fn
                        return this.convertDiscoveredMethod(providedMethod, app.descriptor.connectionId);
                    }, (providedMethod, app) => {
                        // predicate
                        return providedMethod.providedService.application.id === app.descriptor.applicationId;
                    })
                    .toArray();

            } else {
                discoveredMethods = providedMethods.map(pm => this.convertDiscoveredMethod(pm));
            }


            this.log.debug(`Discovered ${discoveredMethods.length} methods`);
        
            const payload = ClientProtocolHelper.discoveryMethodResponsePayload({methods: discoveredMethods});

            await sourceChannel.sendLastMessage(payload);

        } catch (e) {
            this.log.error('Failed to execute discovery', e);
            sourceChannel.close(new ErrorCompletion(new ClientError(e)));
        }

    }

    private convertDiscoveredMethod(pm: ProvidedMethod, connectionId?: UniqueId): DiscoveredMethod {
        const methodType: MethodType = pm.method.type;
        const methodTitle = pm.title;
        const inputMessageId = pm.method.requestMessage.id;
        const outputMessageId = pm.method.responseMessage.id;

        const providedMethod = {
            providedService: {
                serviceId: pm.providedService.service.id,
                serviceAlias: pm.providedService.alias,
                applicationId: pm.providedService.application.id,
                connectionId
            },
            methodId: pm.method.name
        };

        return {
            methodType,
            methodTitle,
            inputMessageId,
            outputMessageId,
            providedMethod
        };

    }

}