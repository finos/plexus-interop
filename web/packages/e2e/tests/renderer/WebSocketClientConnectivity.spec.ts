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
import { ClientConnectivityTests } from "../echo/ClientConnectivityTests";

describe("Web Socket Client connectivity", () => {

    const clientsSetup = new ClientsSetup();
    const transportsSetup = new TransportsSetup();
    const wsUrl = readWsUrl();

    const connectivityTests = new ClientConnectivityTests(
        transportsSetup.createWebSocketTransportProvider(wsUrl), 
        clientsSetup);
    
    it("Can receive WS URL from Broker", () => {
        expect(wsUrl).is.not.empty;
    });

    it("Can connect/disconnect from running Broker instance", function (done) {
        this.timeout(3000);
        let wsUrl = readWsUrl();
        clientsSetup
            .createEchoClient(transportsSetup.createWebSocketTransportProvider(wsUrl))
            .then(client => {
                expect(client).to.not.be.undefined;
                client.disconnect().then(() => {
                    done();
                });
            });
    });

    it("Receives error if provide wrong cliend id to Broker", function() {
        return connectivityTests.testClientReceiveErrorIfProvideWrongId();
    });

});