
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
        wsAddressDir: "Servers/ws-v1",
        wsAddressFile: "address",
        startScript: "LaunchBroker.cmd"
    };

    const startScript = path.join(config.brokerBaseDir, config.startScript);
    const wsAddressDir = path.join(config.brokerBaseDir, config.wsAddressDir);

    log("Broker start script", startScript);
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
            const fullPath = `${config.brokerBaseDir}/address`;
            readAddressAndRunTests(receivedPath);
        }
    }, 5000);

    log("Starting Broker ...");
    brokerProcess = exec(startScript, {
        cwd: config.brokerBaseDir
    }, (error, stdout, stderr) => {
        log("Broker stopped");
        if (error) {
            console.error('Std Error:', stderr);
            console.error('Error:', error);
        }
        log('StdOut:', stdout);
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
        if (error) {
            console.error('Std Error:', stderr);
            console.error('Error: ', error);
        }
        log('StdOut', stdout);
        killBroker();
    });
}

main();


