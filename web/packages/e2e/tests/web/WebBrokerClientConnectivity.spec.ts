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
import { readHostUrl } from "../common/utils";
import { ClientConnectivityTests } from "../echo/ClientConnectivityTests";

describe("Web Broker: Client connectivity", () => {

    const clientsSetup = new ClientsSetup();
    const transportsSetup = new TransportsSetup();
    const proxyHost = readHostUrl();

    const connectivityTests = new ClientConnectivityTests(
        transportsSetup.createCrossDomainTransportProvider(proxyHost),
        clientsSetup);

    it("Can receive Proxy Host from Broker", () => {
        expect(proxyHost).is.not.empty;
    });

    it("Can connect/disconnect from running Broker instance", async function () {
        this.timeout(5000);
        return clientsSetup
            .createEchoClient(transportsSetup.createCrossDomainTransportProvider(proxyHost))
            .then(client => {
                expect(client).to.not.be.undefined;
                return client.disconnect();
            })
            .catch(e => {
                console.error("Failed", e);
                throw e;
            });
    });

    it("Receives error if provide wrong client id to Broker", function () {
        return connectivityTests.testClientReceiveErrorIfProvideWrongId();
    });

});