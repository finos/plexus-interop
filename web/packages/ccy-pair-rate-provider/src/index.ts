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
import { WebCcyPairRateProviderClientBuilder, WebCcyPairRateProviderClient } from "./gen/WebCcyPairRateProviderGeneratedClient";
import { WebSocketConnectionFactory } from "@plexus-interop/websocket-transport";
import * as plexus from "./gen/plexus-messages";

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

new WebCcyPairRateProviderClientBuilder()
    .withClientDetails({
        applicationId: "vendorA.fx.WebCcyPairRateProvider",
        applicationInstanceId: instanceId
    })
    .withTransportConnectionProvider(() => new WebSocketConnectionFactory(new WebSocket(webSocketUrl)).connect())
    .withCcyPairRateServiceInvocationsHandler({
        onGetRate: async (ccyPair: plexus.fx.ICcyPair) => {
            console.log(`Received request for ${ccyPair.ccyPairName}'s Rate`);
            return {
                ccyPairName: ccyPair.ccyPairName,
                rate: Math.floor(Math.random() * 10) + 1
            };
        }
    })
    .connect()
    .then(() => console.log("Connected to Broker"))
    .catch(e => console.error("Connection failure", e)); 