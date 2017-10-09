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
import { WebCcyPairRateViewerClientBuilder, WebCcyPairRateViewerClient } from "./gen/WebCcyPairRateViewerGeneratedClient";
import { WebSocketConnectionFactory } from "@plexus-interop/websocket-transport";

// Read launch arguments, provided by Electron Launcher
declare var window: any;
const electron = window.require("electron");
const remote = electron.remote;
const electronWindow: any = remote.getCurrentWindow();

const webSocketUrl = remote.getCurrentWindow().plexusBrokerWsUrl;
const instanceId = remote.getCurrentWindow().plexusAppInstanceId;
// enable dev tools
document.addEventListener("keydown", function (e) {
    if (e.which === 123) {
        // F12
        electronWindow.toggleDevTools();
    } else if (e.which === 116) {
        // F5
        location.reload();
    }
});

const outEl = document.getElementById("out");
const log = (msg: string) => {
    console.log(msg);
    outEl.innerText = outEl.innerText + '\n' + msg;
};

new WebCcyPairRateViewerClientBuilder()
    // App's ID and Instance ID received from Launcher
    .withClientDetails({
        applicationId: "vendorB.fx.WebCcyPairRateViewer",
        applicationInstanceId: instanceId
    })
    // Pass Transport to be used for connecting to Broker
    .withTransportConnectionProvider(() => new WebSocketConnectionFactory(new WebSocket(webSocketUrl)).connect())
    .connect()
    .then(async (rateViewerClient: WebCcyPairRateViewerClient) => {
        log("Connected to Broker, sending Invocation Request");
        // Client connected, we can use generated Proxy Service to perform invocation
        const ccyPairRate = await rateViewerClient.getCcyPairRateServiceProxy().getRate({ccyPairName: "EURUSD"});
        log(`Received rate ${ccyPairRate.ccyPairName}-${ccyPairRate.rate}`);
    });
