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
import { ClientsSetup } from "../common/ClientsSetup";
import { TransportsSetup } from "../common/TransportsSetup";
import { readHostUrl } from "../common/utils";
import { DiscoveryTests } from "../echo/DiscoveryTests";

describe("Web Broker: Discovery", () => {

    const clientsSetup = new ClientsSetup(500);
    const transportsSetup = new TransportsSetup();

    const proxyHost = readHostUrl();

    const discoveryTests = new DiscoveryTests(
        transportsSetup.createCrossDomainTransportProvider(proxyHost),
        clientsSetup);

    it("Receives discovered methods by input message id", function() {
        this.timeout(3000);
        return discoveryTests.testMethodDiscoveredByInputMessageId();
    });

    it("Receives discovered methods by output message id", function() {
        return discoveryTests.testMethodDiscoveredByOutputMessageId();
    });

    it("Receives discovered methods by method reference", function() {
        return discoveryTests.testMethodDiscoveredByReference();
    });

});