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
import { readWsUrl } from "../common/utils";
import { DiscoveryTests } from "../echo/DiscoveryTests";

describe("Client: Web Socket Discovery", () => {

    const clientsSetup = new ClientsSetup();
    const transportsSetup = new TransportsSetup();

    const wsUrl = readWsUrl();    
    
    const pointToPointTests = new DiscoveryTests(
        transportsSetup.createWebSocketTransportProvider(wsUrl),
        clientsSetup);

    it("Receives discovered methods by input message id", function() {
        this.timeout(3000);
        return pointToPointTests.testMethodDiscoveredByInputMessageId();
    });

    it("Receives discovered methods by output message id", function() {
        return pointToPointTests.testMethodDiscoveredByOutputMessageId();
    });

    it("Receives discovered methods by method reference", function() {
        return pointToPointTests.testMethodDiscoveredByReference();
    });

    it("Receives discovered service by service ID", function() {
        return pointToPointTests.testServiceDiscoveredById();
    });

    // TODO uncomment when Broker start to answer with empty response
    // it("Receives empty Service Discovery response if ID is wrong", function() {
    //     return pointToPointTests.testServiceDiscoveryReceivesEmptyResponseForWrongId();
    // });

    it("Can invoke discovered unary method passing serialized data", function() {
        return pointToPointTests.testClientCanInvokeDiscoveredMethod();
    });

    it("Can invoke discovered server streaming method passing serialized data", function() {
        return pointToPointTests.testClientCanInvokeDiscoveredServerStreamingRequest();
    });

    it("Can invoke discovered bidi streaming method passing serialized data", function() {
        return pointToPointTests.testClientCanInvokeDiscoveredBidiStreamingRequest();
    });

});