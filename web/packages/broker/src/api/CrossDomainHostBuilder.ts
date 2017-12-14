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
import { EventBus } from "../bus/EventBus";
import { CrossDomainHost } from "../bus/cross/host/CrossDomainHost";
import { CrossDomainHostConfig } from "../bus/cross/host/CrossDomainHostConfig";
import { JStorageEventBus } from "../bus/same/JStorageEventBus";

export class CrossDomainHostBuilder {

    private eventBus: EventBus = new JStorageEventBus();

    private crossDomainConfig: CrossDomainHostConfig;

    public withEventBus(eventBus: EventBus): CrossDomainHostBuilder {
        this.eventBus = eventBus;
        return this;
    }

    public withCrossDomainConfig(crossDomainConfig: CrossDomainHostConfig): CrossDomainHostBuilder {
        this.crossDomainConfig = crossDomainConfig;
        return this;
    }

    public async build(): Promise<CrossDomainHost> {
        const crossDomainHost = new CrossDomainHost(this.eventBus, this.crossDomainConfig);
        await crossDomainHost.connect();
        return crossDomainHost;
    }

}