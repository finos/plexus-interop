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
import { ProvidedMethodReference, InteropRegistryService } from '@plexus-interop/metadata';
import { GenericClientApi } from '@plexus-interop/client';
import { Method } from '../api';
import { DiscoveryMode, ProvidedServiceReference, DiscoveredMethod, MethodType } from '@plexus-interop/client-api';
import { getAlias, getAppAliasById } from '../metadata';
import { PartialPeerDescriptor } from '../PartialPeerDescriptor';

export class DiscoverMethodsHandler {

    public constructor(
        private readonly genericClienApi: GenericClientApi,
        private readonly registryService: InteropRegistryService
    ) { }

    public async discoverMethods(type?: MethodType): Promise<Method[]> {
        const provided = await this.genericClienApi.discoverMethod({
            discoveryMode: DiscoveryMode.Online
        });
        const methods = provided.methods || [];
        return methods
            .filter(m => !type || type === m.methodType)
            .map(this.plexusMethodToCommon);
    }

    private plexusMethodToCommon(pm: DiscoveredMethod): Method {
        const providedMethod = pm.providedMethod as ProvidedMethodReference;
        const providedService = providedMethod.providedService as ProvidedServiceReference;
        const appId = providedService.applicationId as string;
        return {
            name: getAlias(pm.options) || providedMethod.methodId as string,
            acceptType: pm.inputMessageId,
            returnType: pm.outputMessageId,
            peer: new PartialPeerDescriptor(
                getAppAliasById(appId, this.registryService) || appId,
                appId)
        };
    }
}