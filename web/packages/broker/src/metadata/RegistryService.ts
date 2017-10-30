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

export interface RegistryService {

    getApplication(appId: string): Application;

    getConsumedService(appId: string): ConsumedService;

    getConsumedMethod(appId: string, reference: ConsumedMethodReference): ConsumedMethod;

    getProvidedService(reference: ProvidedServiceReference): ProvidedMethod;

    getMatchingProvidedMethods(appId: string, consumedMethodReference: ConsumedMethodReference): ProvidedMethod[];    

}