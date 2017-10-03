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

// We pack launcher using browserify due to yarn worspaces usage
// this is a hack to inject LongJs to ProtobuffJs library
const Long = require("long");
declare var global: any;
if (global && global.dcodeIO) {
    global.dcodeIO.Long = Long;
} else if (global) {
    global.dcodeIO = {
        Long
    };
}

import { app, BrowserWindow } from "electron";
import { FileLogger } from "./logger/FileLogger";
import { Logger, LoggerFactory, PrefixedLogger, LogLevel } from "@plexus-interop/common";
LoggerFactory.setLogLevel(LogLevel.TRACE);
let log = new FileLogger(LoggerFactory.getLogger("ElectronLauncherMain"));

// substitute logger implementatiuon with simple file logger 
LoggerFactory.getLogger = (name: string) => new PrefixedLogger(log, name);

import { ElectronAppLauncher } from "./ElectronAppLauncher";

log.info("Started");

const appsIndex = process.argv.findIndex(v => v === "--apps");
const appsToLaunch = appsIndex > 0 && appsIndex <= process.argv.length - 2 ? process.argv[appsIndex + 1].split(";") : [];

app.on('ready', () => {
    log.info("Connecting to Broker");
    const electronAppLauncher = new ElectronAppLauncher(log, appsToLaunch);
    electronAppLauncher.start()
        .then(() => {
            log.info("Connected to Broker");
        })
        .catch(e => {
            log.error("Connection to broker failed", e);
            app.quit();
        })
});