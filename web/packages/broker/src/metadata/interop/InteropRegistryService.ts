/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import { Application } from './model/Application';
import { ConsumedService } from './model/ConsumedService';
import { ConsumedMethodReference } from './model/ConsumedMethodReference';
import { ConsumedMethod } from './model/ConsumedMethod';
import { ProvidedMethod } from './model/ProvidedMethod';
import { ProvidedServiceReference } from './model/ProvidedServiceReference';
import { InteropRegistryProvider } from './InteropRegistryProvider';
import { join, distinct, Logger, LoggerFactory, flatMap, ExtendedMap } from '@plexus-interop/common';
import { InteropRegistry } from './model/InteropRegistry';
import { ConsumedServiceReference } from './model/ConsumedServiceReference';
import { ProvidedService } from './model/ProvidedService';
import { Method } from './model/Method';

export class InteropRegistryService {

    private readonly log: Logger = LoggerFactory.getLogger('RegistryService');

    private appProvidedMethodsCache: ExtendedMap<string, ProvidedMethod[]> = ExtendedMap.create<string, ProvidedMethod[]>();

    private registry: InteropRegistry;

    constructor(private readonly registryProvider: InteropRegistryProvider) {
        this.updateRegistry(registryProvider.getCurrent());
        this.registryProvider.getRegistry().subscribe({
            next: updatedRegistry => this.updateRegistry(updatedRegistry)
        });
    }

    public getApplication(appId: string): Application {
        const result = this.registry.applications.valuesArray().find(app => app.id === appId);
        if (!result) {
            throw new Error(`${appId} app not found`);
        }
        return result;
    }

    public getRegistry(): InteropRegistry {
        return this.registry;
    }

    public getConsumedService(appId: string, serviceReference: ConsumedServiceReference): ConsumedService {
        const app = this.getApplication(appId);
        const result = app.consumedServices.find(consumedService => consumedService.service.id === serviceReference.serviceId
            && (!serviceReference.serviceAlias || serviceReference.serviceAlias === consumedService.service.serviceAlias));
        if (!result) {
            throw new Error(`Service not found`);
        }
        return result;
    }

    public getConsumedMethod(appId: string, reference: ConsumedMethodReference): ConsumedMethod {

        const app = this.getApplication(appId);

        const consumedMethods: ConsumedMethod[] = flatMap<ConsumedService, ConsumedMethod>(
            consumedService => consumedService.methods.valuesArray(),
            app.consumedServices);

        const result = consumedMethods.find(method => {
            return this.equalsIfExist(reference.methodId, method.method.name)
                && (!reference.consumedService
                    || (this.equalsIfExist(reference.consumedService.serviceAlias, method.consumedService.service.serviceAlias)
                        && this.equalsIfExist(reference.consumedService.serviceId, method.consumedService.service.id)));
        });

        if (!result) {
            throw new Error(`Service not found`);
        }

        return result;
    }

    public getProvidedService(reference: ProvidedServiceReference): ProvidedService {
        const result = this.getApplication(reference.applicationId as string)
            .providedServices.find(x => this.equalsIfExist(reference.serviceAlias, x.service.serviceAlias) && this.equalsIfExist(reference.serviceId, x.service.id));
        if (!result) {
            throw new Error('Provided Service not found');
        }
        return result;
    }

    public getMatchingProvidedMethods(appId: string, consumedMethodReference: ConsumedMethodReference): ProvidedMethod[] {
        const consumedMethod = this.getConsumedMethod(appId, consumedMethodReference);
        return this.getMatchingProvidedMethodsFromConsumed(consumedMethod);
    }

    public getProvidedServices(appId: string): ProvidedService[] {
        const app = this.registry.applications.get(appId);
        if (!app) {
            throw new Error(`App ${appId} doesn't exist`);
        }
        return app.providedServices;
    }

    public getConsumedServices(appId: string): ConsumedService[] {
        const app = this.registry.applications.get(appId);
        if (!app) {
            throw new Error(`App ${appId} doesn't exist`);
        }
        return app.consumedServices;
    }

    public getMatchingProvidedMethodsForApp(app: Application): ProvidedMethod[] {
        return this.appProvidedMethodsCache.getOrAdd(app.id, () => this.getMatchingProvidedMethodsForAppInternal(app));
    }
    
    public getMatchingProvidedMethodsFromConsumed(consumedMethod: ConsumedMethod): ProvidedMethod[] {
        return this.getMatchingProvidedMethodsForApp(consumedMethod.consumedService.application)
            .filter(providedMethod => this.equals(consumedMethod.method, providedMethod.method));
    }
    
    private updateRegistry(registry: InteropRegistry): void {
        this.log.debug('Registry updated');
        this.registry = registry;
        this.appProvidedMethodsCache.clear();
    }

    private getMatchingProvidedMethodsForAppInternal(app: Application): ProvidedMethod[] {

        const allProvidedServices: ProvidedService[] = flatMap<Application, ProvidedService>(
            app => app.providedServices, this.registry.applications.valuesArray());

        const consumedProvidedPairs = join(
            app.consumedServices,
            allProvidedServices,
            (consumed, provided) => {
                return { consumed, provided };
            },
            // matched by service id app permissions
            (c, p) => p.to.isMatch(c.application.id)
                && c.from.isMatch(p.application.id)
                && c.service.id === p.service.id
                && c.alias === p.alias);

        const result = flatMap<{ consumed: ConsumedService, provided: ProvidedService }, ProvidedMethod>(pair => {

            const allMatchedProvidedMethods: ProvidedMethod[] = join(
                pair.consumed.methods.valuesArray(),
                pair.provided.methods.valuesArray(),
                (c, p) => p,
                // matched by method name
                (c, p) => c.method.name === p.method.name);

            return distinct<ProvidedMethod>(allMatchedProvidedMethods,
                pMethod => `${pMethod.method.name}-${pMethod.providedService.application.id}`);

        }, consumedProvidedPairs);

        return result;
    }

    private equals(x: Method, y: Method): boolean {
        return x.name === y.name && x.service.id === y.service.id;
    }

    private equalsIfExist(expect: any, result: any): boolean {
        return typeof expect === 'undefined' || expect === result;
    }
}