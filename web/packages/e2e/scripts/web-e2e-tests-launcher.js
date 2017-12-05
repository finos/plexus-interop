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
const argv = require('minimist')(process.argv.slice(2));
const { spawn, exec } = require('child_process');
const kill = require('tree-kill');
const log = console.log.bind(console);

function main() {

    log('Passed arguments' + JSON.stringify(argv));
    let httpServerProcess;
    
    const port = argv.port || 3001;
    const baseDir = argv.baseUrl || `${__dirname}/../metadata`;  
    const proxyPagePath = argv.path || `${__dirname}/`;

    const proxyHostUrl = `http://localhost:${port}/${proxyPagePath}`;

    log(`Starting http-server in ${baseDir}, listening on ${port} port`);

    httpServerProcess = exec(`http-server ${baseDir} -p ${port}`, {
        cwd: process.cwd()
    }, (error, stdout, stderr) => {
        log("http-server stopped");
        if (error || stderr) {
            console.error('Std Error:', stderr);
            console.error('Error: ', error);
        }
        killHttpServerProcess();
    });

    setTimeout(() => {
        runElectronTest(proxyHostUrl);
    }, 1000);

}

function killHttpServerProcess() {
    if (httpServerProcess) {
        log("Killing broker process ...");
        kill(httpServerProcess.pid);
        log("Kill signal sent");
    }
}

function runElectronTest(path) {
    log("Starting Electron Tests ...");
    exec(`electron-mocha --require --path ${path} ${argv.debug ? "--debug" : ""} --renderer --reporter spec --colors`, {
        cwd: process.cwd()
    }, (error, stdout, stderr) => {
        log("Electron tests stopped, killing HTTP Server");
        if (error || stderr) {
            console.error('Std Error:', stderr);
            console.error('Error: ', error);
        }
        log('StdOut', stdout);
        killHttpServerProcess();
    });
}

main();


