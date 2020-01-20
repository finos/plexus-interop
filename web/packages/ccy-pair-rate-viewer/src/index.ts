/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
declare var window: any;
import { WebCcyPairRateViewerClientBuilder, WebCcyPairRateViewerClient } from './gen/WebCcyPairRateViewerGeneratedClient';
import { WebSocketConnectionFactory } from '@plexus-interop/websocket-transport';
import { LoggerFactory, LogLevel } from '@plexus-interop/common';

// Read launch arguments, provided by Electron Launcher
LoggerFactory.setLogLevel(LogLevel.TRACE);
const electron = window.require('electron');
const remote = electron.remote;
const electronWindow: any = remote.getCurrentWindow();

const webSocketUrl = remote.getCurrentWindow().plexusBrokerWsUrl;
const instanceId = remote.getCurrentWindow().plexusAppInstanceId;
// enable dev tools
document.addEventListener('keydown', function (e) {
    if (e.which === 123) {
        // F12
        electronWindow.toggleDevTools();
    } else if (e.which === 116) {
        // F5
        location.reload();
    }
});

const outEl = document.getElementById('out');

const log = (msg: string) => {
    console.log(msg);
    outEl.innerText = outEl.innerText + '\n' + msg;
};

window.getRate = () => log('Not connected to Broker');

new WebCcyPairRateViewerClientBuilder()
    .withClientDetails({
        applicationId: 'vendor_b.fx.WebCcyPairRateViewer',
        applicationInstanceId: instanceId
    })
    .withTransportConnectionProvider(() => new WebSocketConnectionFactory(new WebSocket(webSocketUrl)).connect())
    .connect()
    .then(async (rateViewerClient: WebCcyPairRateViewerClient) => {
        log('Connected to Broker');
        window.getRate = async () => {
            const ccyPair = (document.getElementById('ccyPair') as HTMLInputElement).value;
            log(`Sending request for ${ccyPair}`);
            const ccyPairRate = await rateViewerClient.getCcyPairRateServiceProxy().getRate({ccyPairName: ccyPair});
            log(`Received rate ${ccyPairRate.ccyPairName} - ${ccyPairRate.rate}`);
        };
    });
