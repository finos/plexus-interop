/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Application } from "./model/Application";
import { ConsumedService } from "./model/ConsumedService";
import { ConsumedMethodReference } from "./model/ConsumedMethodReference";
import { ConsumedMethod } from "./model/ConsumedMethod";
import { ProvidedMethod } from "./model/ProvidedMethod";
import { ProvidedServiceReference } from "./model/ProvidedServiceReference";
import { RegistryProvider } from "./RegistryProvider";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { Registry } from "./model/Registry";
import { ConsumedServiceReference } from "./model/ConsumedServiceReference";

export class RegistryService {

    private readonly log: Logger = LoggerFactory.getLogger("RegistryService");

    private registry: Registry;

    constructor(private readonly registryProvider: RegistryProvider) {
        this.registry = registryProvider.getCurrent();
        this.registryProvider.getRegistry().subscribe({
            next: updatedRegistry => {
                this.log.debug("Registry updated");
                this.registry = updatedRegistry;
            }
        });
    }

    public getApplication(appId: string): Application {
        const result = this.registry.applications.find(app => app.id === appId);
        if (!result) {
            throw new Error(`${appId} app not found`)
        }
        return result;
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

    // TODO implement 

    public getConsumedMethod(appId: string, reference: ConsumedMethodReference): ConsumedMethod {
        throw "Not implemented";
    }

    public getProvidedService(reference: ProvidedServiceReference): ProvidedMethod {
        throw "Not implemented";
    }

    public getMatchingProvidedMethods(appId: string, consumedMethodReference: ConsumedMethodReference): ProvidedMethod[] {
        throw "Not implemented";
    }

}