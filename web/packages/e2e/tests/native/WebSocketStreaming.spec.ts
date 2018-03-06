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
import { ServerStreamingInvocationTests } from "../echo/ServerStreamingInvocationTests";
import { BidiStreamingInvocationTests } from "../echo/BidiStreamingTests";
import { ClientStreamingTests } from "../echo/ClientStreamingTests";

describe("Client: Web Socket Streaming invocation", () => {

    const clientsSetup = new ClientsSetup();
    const transportsSetup = new TransportsSetup();

    const wsUrl = readWsUrl();

    const serverStreamingTests = new ServerStreamingInvocationTests(
        transportsSetup.createWebSocketTransportProvider(wsUrl),
        clientsSetup);

    const bidiStreamingTests = new BidiStreamingInvocationTests(
        transportsSetup.createWebSocketTransportProvider(wsUrl),
        clientsSetup);

    const clientStreamingTests = new ClientStreamingTests(transportsSetup.createWebSocketTransportProvider(wsUrl),
        clientsSetup);

    it("Sends streaming response from server using serverStreaming invocation", function () {
        return serverStreamingTests.testServerSendsStreamToClient();
    });

    it("Sends few streams in parrallel to client using serverStreaming invocation", function () {
        return serverStreamingTests.testServerSendsFewStreamsInParrallelToClient();
    });

    it("Sends stream of messages and error to client", function () {
        return serverStreamingTests.testServerSendsStreamWithErrorToClient();
    });

    it("Sends stream of messages and cancel operation to client", function () {
        return serverStreamingTests.testServerSendsStreamWithCancelToClient();
    });

    it("Sends streaming messages in two directions", function () {
        this.timeout(5000);
        return bidiStreamingTests.testClientAndServerCanSendMessages();
    });

    it("Sends client stream messages to server", function () {
        return clientStreamingTests.testClientCanSendStreamToServer();
    });

    it("Server receives client's completion before response for Client Streaming", function () {
        return clientStreamingTests.testServerReceivesClientCompletionBeforeResponse();
    });

    it("Client can cancel invocation", function() {
        return bidiStreamingTests.testClientCanCancelInvocation();
    });

    it("Client receives exception from server", function() {
        return serverStreamingTests.testServerExceptionReceivedByClient();
    });

});