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
import { Logger, LoggerFactory, DomUtils } from "@plexus-interop/common";
import { CrossDomainEventBus } from "../bus/cross/CrossDomainEventBus";

export class CrossDomainEventBusProvider {

    private readonly log: Logger = LoggerFactory.getLogger("CrossDomainEventBusProvider");

    public constructor(private readonly proxyUrlProvider: () => Promise<string>) { }

    public async connect(): Promise<EventBus> {

        this.log.info("Resolving Proxy Iframe URL");
        const proxyIframeUrl = await this.proxyUrlProvider();

        this.log.info(`Initialyzing proxy iFrame with url [${proxyIframeUrl}]`);
        const proxyiFrame = await DomUtils.createHiddenIFrame("plexus-proxy-iframe", proxyIframeUrl);

        this.log.info("Initialyzing Event Bus");
        const crossDomainBus: CrossDomainEventBus = new CrossDomainEventBus(proxyiFrame, DomUtils.getOrigin(proxyIframeUrl));
        await crossDomainBus.init();
        return crossDomainBus;

    }

}