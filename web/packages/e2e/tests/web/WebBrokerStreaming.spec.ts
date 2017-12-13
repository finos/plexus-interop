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
import { ServerStreamingInvocationTests } from "../echo/ServerStreamingInvocationTests";
import { BidiStreamingInvocationTests } from "../echo/BidiStreamingTests";
import { ClientInvocationTests } from "../echo/ClientStreamingTests";

describe("Client: Web Broker Point to Point invocation", () => {

    const clientsSetup = new ClientsSetup(500);
    const transportsSetup = new TransportsSetup();

    const proxyHost = readHostUrl();

    const serverStreamingTests = new ServerStreamingInvocationTests(
        transportsSetup.createCrossDomainTransportProvider(proxyHost),
        clientsSetup);

    const bidiStreamingTests = new BidiStreamingInvocationTests(
        transportsSetup.createCrossDomainTransportProvider(proxyHost),
        clientsSetup);

    const clientStreamingTests = new ClientInvocationTests(transportsSetup.createCrossDomainTransportProvider(proxyHost),
        clientsSetup);

    it("Sends streaming response from server using serverStreaming invocation", function () {
        return serverStreamingTests.testServerSendsStreamToClient();
    });

    it("Sends few streams in parrallel to client using serverStreaming invocation", function () {
        return serverStreamingTests.testServerSendsFewStreamsInParrallelToClient();
    });

});