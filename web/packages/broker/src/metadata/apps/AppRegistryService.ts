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
import { AppRegistryProvider } from "./AppRegistryProvider";
import { Application } from "./model/Application";
import { AppRegistry } from "./model/AppRegistry";
import { Logger, LoggerFactory } from "@plexus-interop/common";

export class AppRegistryService {

    private readonly log: Logger = LoggerFactory.getLogger("AppRegistryService");

    private appsRegistry: AppRegistry;

    constructor(private readonly appRegistryProvider: AppRegistryProvider) {
        this.appsRegistry = appRegistryProvider.getCurrent();
        this.appRegistryProvider.getAppRegistry().subscribe({
            next: update => {
                this.log.debug(`App registry updated, apps size [${update.apps.size}]`);
                this.appsRegistry = update;
            }
        });
    }

    public getApplication(id: string): Application {
        const result = this.appsRegistry.apps.get(id);
        if (!result) {
            throw new Error(`Application with id [${id}] is not found in App Registry`);
        }
        return result;
    }

}