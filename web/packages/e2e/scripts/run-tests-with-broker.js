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
const fs = require("fs");
const path = require("path");
const argv = require('minimist')(process.argv.slice(2));
const exec = require('child_process').exec;
const kill = require('tree-kill');
const readline = require('./file-utils').readline;
const onFileAdded = require('./file-utils').onFileAdded;
const stripBom = require('strip-bom');
const log = console.log.bind(console);

let brokerProcess;

function main() {

    log('Passed arguments' + JSON.stringify(argv));
    log('Passed arguments' + JSON.stringify(process.argv));

    const config = {
        brokerBaseDir: `${__dirname}/../../../../bin/win-x86/samples`,
        wsAddressDir: "servers/ws-v1",
        wsAddressFile: "address",
        brokerCmd: "../broker/plexus.exe",
        brokerArgs: ` broker ${__dirname}/../metadata`
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

    let launched = false;
    onFileAdded(wsAddressDir, (receivedPath) => {
        if (!launched) {
            launched = true;
            readAddressAndRunTests(receivedPath);
        }
    });

    // if file addition was not handled due to race condition, 
    // then try to read port from hardcoded path
    setTimeout(() => {
        if (!launched) {
            launched = true;
            log(`No file notification received, trying to read from default location ${addressFile}`);
            readAddressAndRunTests(addressFile);
        }
    }, 5000);

    log("Starting Broker ...");
    brokerProcess = exec(fullBrokerCmd + config.brokerArgs, {
        cwd: config.brokerBaseDir,
        maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
        log("Broker stopped");
        if (error) {
            console.error('Std Error:', stderr);
            console.error('Error:', error);
        }
        // if (stderr) {
        //     log('StdErr:', stderr);
        // }
        if (argv.printBrokerStdout) {
            log('StdOut', stdout);
        }
        process.exit();
    });
}

function readAddressAndRunTests(path) {
    log(`WS Server file ${path} has been added, reading server URL`);
    readline(path, (line) => {
        log('WS Server URL received', line);
        line = stripBom(line);
        runElectronTest(line);
    });
}

function killBroker() {
    if (brokerProcess) {
        log("Killing broker process ...");
        kill(brokerProcess.pid);
        log("Kill signal sent");
    }
}

function runElectronTest(wsUrl) {
    log("Starting Electron Tests ...");
    exec(`electron-mocha ${argv.file} --wsUrl ${wsUrl} ${argv.debug ? "--debug" : ""}  --renderer --reporter spec --colors`, {
        cwd: process.cwd()
    }, (error, stdout, stderr) => {
        log("Electron tests stopped, killing Broker");
        if (error || stderr) {
            console.error('Std Error:', stderr);
            console.error('Error: ', error);
        }
        log('StdOut', stdout);
        killBroker();
    });
}

main();


