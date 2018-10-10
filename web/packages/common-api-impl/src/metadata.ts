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

export function getProvidedMethodByAlias(alias: string, consumerApp: Application, registryService: InteropRegistryService): ProvidedMethod {
    const methods = registryService.getMatchingProvidedMethodsForApp(consumerApp);
    const pm = methods.find(pm => !!pm.options && !!pm.options.find(o => o.id.endsWith('alias') && o.value === alias));
    if (!pm) {
        throw new Error(`Provided Method not found for ${alias}`);
    }
    return methods.find(pm => !!pm.options && !!pm.options.find(o => o.id.endsWith('alias') && o.value === alias));
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
