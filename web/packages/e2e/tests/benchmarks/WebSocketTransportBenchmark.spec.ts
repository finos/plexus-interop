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
import { expect } from "chai";
import { ClientsSetup } from "../common/ClientsSetup";
import { TransportsSetup } from "../common/TransportsSetup";
import { readWsUrl } from "../common/utils";
import { EchoClientBenchmark } from "../echo/EchoClientBenchmark";

describe("Web Socket Client Benchmarks", () => {

    const clientsSetup = new ClientsSetup();
    const transportsSetup = new TransportsSetup();
    const wsUrl = readWsUrl();

    const echoServiceBenchmark = new EchoClientBenchmark(
        transportsSetup.createWebSocketTransportProvider(wsUrl), 
        clientsSetup);

    it("Sends 200 of messages in one second", function() {
        this.timeout(10000);
        return (async () => {
            console.log("Starting", new Date().toISOString());        
            const result = await echoServiceBenchmark.testUnaryMessagesSentWithinPeriod(500, 1024, 5000);
            console.log("End", new Date().toISOString());
            console.log("Benchmark result:", JSON.stringify(result));
            expect(result.messagesSent).to.be.greaterThan(500);
            console.log("Passed");
        })();
    });

});