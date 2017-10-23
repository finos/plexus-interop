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
const Long = require("long");
(<any>window).dcodeIO = { Long: Long };

import { LoggerFactory, LogLevel } from "@plexus-interop/common";

LoggerFactory.setLogLevel(LogLevel.TRACE);

import { WebGreetingServerClientBuilder } from "./WebGreetingServerGeneratedClient";
import { WebSocketConnectionFactory } from "@plexus-interop/websocket-transport";

import * as plexus from "./gen/plexus-messages";
import { DomLogger } from "../../common/DomLogger";

declare var window: any;

const electron = window.require("electron")
const remote = electron.remote;
const log = new DomLogger("out");
const windowAny: any = remote.getCurrentWindow();
const wsUrl = windowAny.plexusBrokerWsUrl;
const instanceId = windowAny.plexusAppInstanceId;

log.info(`Received Web Socket URL - ${wsUrl}`);
log.info(`Received App Instance ID - ${instanceId.toString()}`);

// Reload and Dev tools hot keys
document.addEventListener("keydown", function (e) {
    if (e.which === 123) {
        // F12
        windowAny.toggleDevTools();
    } else if (e.which === 116) {
        // F5
        location.reload();
    }
});

new WebGreetingServerClientBuilder()
    .withGreetingServiceInvocationsHandler({
        onUnary: async (invocationContext, request: plexus.interop.samples.IGreetingRequest) => {
            log.info(`Received greeting request - ${request.name}`);
            return {
                greeting: `Hey, ${request.name}!`
            };
        }
    })
    .withClientDetails({
        applicationId: "interop.samples.WebGreetingServer",
        applicationInstanceId: instanceId
    })
    .withTransportConnectionProvider(() => new WebSocketConnectionFactory(new WebSocket(wsUrl)).connect())
    .connect()
    .then(() => log.info("Connected to Broker"))
    .catch(e => {
        log.error("Failed to connect");
        console.error("Failed to connect", e);
    });


