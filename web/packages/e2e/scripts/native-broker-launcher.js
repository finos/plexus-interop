/*
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
const fs = require("fs");
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));
const exec = require('child_process').exec;
const kill = require('tree-kill');
const readline = require('./file-utils').readline;
const onFileAdded = require('./file-utils').onFileAdded;
const stripBom = require('strip-bom');
const log = console.log.bind(console);

/**
 * Starts Broker
 * @return Process and its Working Directory
 */
function start() {

    log("Starting Native Broker instance");

    const config = {
        brokerBaseDir: `${__dirname}/../../../../bin/win-x86/samples`,
        wsAddressDir: "servers/ws-v1",
        wsAddressFile: "address",
        brokerCmd: "../broker/plexus.exe",
        brokerArgs: ` broker -m ${__dirname}/../metadata`
    };

    const fullBrokerCmd = path.join(config.brokerBaseDir, config.brokerCmd);
    const wsAddressDir = path.join(config.brokerBaseDir, config.wsAddressDir);
    const addressFile = path.join(wsAddressDir, config.wsAddressFile);

    try {
        fs.accessSync(addressFile);
        log(`Deleting WS address file ${addressFile}`);
        fs.unlinkSync(addressFile);
        log(`Deleted ${addressFile}`);
    } catch (error) {
        log(`${addressFile} does not exist`);
    }

    log("Broker start cmd", fullBrokerCmd);
    log("Broker working dir", config.brokerBaseDir);
    log("WS address dir", wsAddressDir);

    log("Watching for Web Socket Server address file update");

    return new Promise((resolve, reject) => {

        let brokerProcess;
        let launched = false;
        onFileAdded(wsAddressDir, addressFile, receivedPath => {
            if (!launched) {
                launched = true;
                readClearedLine(receivedPath)
                    .then(line => resolve({
                        workingDir: line,
                        process: brokerProcess
                    }));
            }
        });

        // if file addition was not handled due to race condition, 
        // then try to read port from hardcoded path
        setTimeout(() => {
            if (!launched) {
                launched = true;
                log(`No file notification received, trying to read from default location ${addressFile}`);
                readClearedLine(addressFile)
                    .then(line => resolve({
                        workingDir: line,
                        process: brokerProcess
                    }));
            }
        }, 20000);

        log("Starting Broker ...");
        brokerProcess = exec(fullBrokerCmd + config.brokerArgs, {
            cwd: config.brokerBaseDir,
            maxBuffer: 1024 * 1024
        }, (error, stdout, stderr) => {
            log("Broker stopped");
            if (argv.printBrokerStdout) {
                log('StdOut', stdout);
            }
            process.exit();
        });
    });

}

/**
 * Reads first line, clearing BOM symbol
 */
function readClearedLine(path) {
    return new Promise((resolve, reject) => {
        log(`Reading first line of ${path}`);
        readline(path, (line) => {
            log(`Data received, clearing BOM symbol`, line);
            line = stripBom(line);
            resolve(line);
        });
    });
}

module.exports = {
    start
};

