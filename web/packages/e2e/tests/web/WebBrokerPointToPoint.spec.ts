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
import { PointToPointInvocationTests } from "../echo/PointToPointInvocationTests";

describe("Client: Web Broker Point to Point invocation", () => {

    const clientsSetup = new ClientsSetup(1000);
    const transportsSetup = new TransportsSetup();

    const proxyHost = readHostUrl();

    const pointToPointTests = new PointToPointInvocationTests(
        transportsSetup.createCrossDomainTransportProvider(proxyHost),
        clientsSetup);

    it("Sends invocation request and receives response", function () {
        this.timeout(5000);
        try {
            return pointToPointTests.testMessageSent()
                .catch(e => {
                    console.error("failed", e);
                    debugger;
                })
                .then(() => {
                    debugger;
                    return Promise.resolve();
                });
        } catch (error) {
            debugger;
            return Promise.reject(error);
        }
    });

    it("Sends few invocations in a row", function() {
        this.timeout(5000);        
        return pointToPointTests.testFewMessagesSent();
    });

    // it("Receives error from host", function() {
    //     return pointToPointTests.testHostsExecutionErrorReceived();
    // });

    // it("Receives Client Error from host", function() {
    //     return pointToPointTests.testHostsExecutionClientErrorReceived();
    // });

    // it("Receives string error from host", function() {
    //     return pointToPointTests.testHostsExecutionStringErrorReceived();
    // });

    // it("Receives exception from host", function() {
    //     return pointToPointTests.testHostExecutionExceptionReceived();
    // });

});