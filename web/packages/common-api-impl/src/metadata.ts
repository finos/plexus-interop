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
import { Application, InteropRegistryService, ProvidedMethod, ConsumedMethodReference } from '@plexus-interop/metadata';
import { Method } from './api/client-api';
import { PartialPeerDescriptor } from './PartialPeerDescriptor';
import { Option } from '@plexus-interop/metadata';

const isAliasOption = (o: Option) => o.id.endsWith('alias');

export function getProvidedMethodByAlias(actionAlias: string, registryService: InteropRegistryService, consumerAppMetadata?: Application): ProvidedMethod {
    const methods = !!consumerAppMetadata ?
        registryService.getMatchingProvidedMethodsForApp(consumerAppMetadata)
        : registryService.getProvidedMethods();
    const provideMethod = methods.find(pm => !!pm.options && !!pm.options.find(o => isAliasOption(o) && o.value === actionAlias));
    if (!provideMethod) {
        throw new Error(`Provided Method not found for ${actionAlias}`);
    }
    return provideMethod;
}

export function getAppAliasById(appId: string, registryService: InteropRegistryService): string | undefined {
    const app = registryService.getApplication(appId);
    return getAlias(app.options);
}

export function toConsumedMethodRef(providedMethod: ProvidedMethod): ConsumedMethodReference {
    return {
        consumedService: {
            serviceId: providedMethod.providedService.service.id,
            serviceAlias: providedMethod.providedService.service.serviceAlias
        },
        methodId: providedMethod.method.name
    };
}

export function toMethodDefinition(providedMethod: ProvidedMethod): Method {
    return {
        name: providedMethod.method.name,
        peer: new PartialPeerDescriptor(
            providedMethod.providedService.application.id,
            providedMethod.providedService.application.id,
            false)
    };
}

export function getAlias(options?: Option[]): string | undefined {
    if (!!options) {
        const option = options.find(isAliasOption);
        if (option) {
            return option.value;
        }
    }
    return undefined;
}
