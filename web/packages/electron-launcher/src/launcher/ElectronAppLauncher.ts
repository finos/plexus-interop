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
import { Logger, LoggerFactory } from '@plexus-interop/common';
import { BrowserWindow } from 'electron';
import { ElectronAppLauncherClientBuilder, ElectronAppLauncherClient } from './client/ElectronAppLauncherGeneratedClient';
import * as plexus from './gen/plexus-messages';
import { UniqueId } from '@plexus-interop/transport-common';
import { WebSocketConnectionFactory } from '@plexus-interop/websocket-transport';
import * as fs from 'fs';
import * as log from 'loglevel';
import { MethodInvocationContext } from '@plexus-interop/client';
const stripBom = require('strip-bom');
const path = require('path');

/**
 * Simple launcher, open apps with provided URL and pass App Instance ID and Broker Web Socket URL to them.
 * Properties can be read in renderer process as below:
 * 
 *   var electron = require('electron');
 *   const currentWindow = electron.remote.getCurrentWindow();
 *   const appInstanceId = currentWindow.plexusAppInstanceId;
 *   const plexusBrokerWsUrl = currentWindow.plexusBrokerWsUrl;
 * 
 */
export class ElectronAppLauncher {

    private plexusClient: ElectronAppLauncherClient | null = null;
    private connected: boolean = false;

    private readonly instanceIdEnvProperty: string = 'PLEXUS_APP_INSTANCE_ID';
    private readonly brokerDirEnvProperty: string = 'PLEXUS_BROKER_WORKING_DIR';
    private readonly brokerServerNameEnvProperty: string = 'PLEXUS_BROKER_SERVER_NAME';

    private readonly defaultBrokerServerName = "ws-v1";
    private webSocketAddress: string;
    
    public constructor(
        private log: Logger = LoggerFactory.getLogger('ElectronAppLauncher'),
        private launchOnStartup: string[],
        private defaultBrokerWorkingDir: string) {}

    public async start(): Promise<void> {

        if (this.connected) {
            throw new Error('Already started');
        }

        const brokerWorkingDir = this.readBrokerWorkingDir();
        const brokerServerName = this.getBrokerServerName();
        this.webSocketAddress = await this.readWebSocketUrl(brokerWorkingDir, brokerServerName);
        const launcherAppInstanceId = this.getAppInstanceId();

        this.log.info(`App Instance ID ${launcherAppInstanceId}`);
        this.log.info(`Broker Working Directory ${brokerWorkingDir}`);
        this.log.info(`Broker is running Web Socket Server on ${this.webSocketAddress}, connecting to broker`);

        return new ElectronAppLauncherClientBuilder()
            .withClientDetails({
                applicationId: 'interop.ElectronAppLauncher',
                applicationInstanceId: launcherAppInstanceId
            })
            .withAppLauncherServiceInvocationsHandler({
                onLaunch: async (methodInvocationContext: MethodInvocationContext, request: plexus.interop.IAppLaunchRequest) => {
                    this.log.info('Received launch request: ' + JSON.stringify(request));
                    let launchPath = this.readPath(request);
                    return this.launchApp(launchPath);
                }
            })
            .withTransportConnectionProvider(() => new WebSocketConnectionFactory(new WebSocket(this.webSocketAddress)).connect())
            .connect()
            .then((client) => {
                this.plexusClient = client;
                this.connected = true;
                log.info('Launcher client connected to Broker');
                this.launchOnStartup.forEach(launchPath => {
                    this.launchApp(launchPath)
                        .then(() => log.info(`App Launched for ${launchPath} path`))
                        .catch(() => log.error(`Could not launch app for ${launchPath} path`));
                });
            })
            .catch(e => {
                log.error('Error connecting to broker' + e);
                throw e;
            });

    }
    
    public isCompleteUri(uriString: string): boolean {
        return uriString.startsWith('file:/')
            || uriString.startsWith('http:/')
            || uriString.startsWith('https:/');
    }

    public async disconnect(): Promise<void> {
        if (!this.connected || !this.plexusClient) {
            throw new Error('Not connected');
        }
        return this.plexusClient.disconnect();
    }

    private launchApp(launchPath: string): Promise<plexus.interop.IAppLaunchResponse> {
        this.log.info('Launching app for path: ' + launchPath);
        if (!this.isCompleteUri(launchPath)) {
            // relative file path
            launchPath = this.toFileUri(launchPath);
            this.log.info('Launch path resolved to absolute path: ' + launchPath);
        }
        const appInstanceId = UniqueId.generateNew();
        this.log.info(`Launching instance [${appInstanceId.toString()}] with URL [${launchPath}]`);
        return new Promise<plexus.interop.IAppLaunchResponse>((resolve, reject) => {
            const window = new BrowserWindow();
            // pass url and instance id to App's window
            const windowAny: any = window;
            windowAny.plexusBrokerWsUrl = this.webSocketAddress;
            windowAny.plexusAppInstanceId = appInstanceId;
            window.webContents.on('did-finish-load', () => {
                this.log.debug('Window loaded');
                resolve({
                    appInstanceId
                });
            });
            window.once('ready-to-show', () => {
                this.log.debug('Window ready to show');
                window.show();
            });
            window.loadURL(launchPath);
        });
    }

    private toFileUri(filePath: string): string {
        filePath = path.resolve(filePath).replace(/\\/g, '/');
        // tslint:disable-next-line:quotemark
        if (filePath[0] !== '/') {
            // tslint:disable-next-line:quotemark
            filePath = '/' + filePath;
        }
        return encodeURI('file://' + filePath);
    }

    private readPath(request: plexus.interop.IAppLaunchRequest): string {
        if (!request.launchParamsJson) {
            throw new Error('Request parameters empty, couldn\'t detect launch URL');
        }
        const paramsObj = JSON.parse(request.launchParamsJson);
        if (!paramsObj.path) {
            throw new Error('url parameter empty');
        }
        return paramsObj.path;
    }

    private readBrokerWorkingDir(): string {
        let brokerDir = process.env[this.brokerDirEnvProperty];
        this.log.debug(`Received broker ID ${brokerDir}`);
        if (!brokerDir) {
            this.log.debug(`${this.brokerDirEnvProperty} env property is empty, resolving to default ${this.defaultBrokerWorkingDir}`);
            brokerDir = path.resolve(this.defaultBrokerWorkingDir);
        }
        return brokerDir as string;
    }

    private getBrokerServerName(): string {
        const serverName = process.env[this.brokerServerNameEnvProperty];
        this.log.debug(`Received broker server name ${serverName}`);
        if (!serverName) {
            this.log.debug(`${this.brokerServerNameEnvProperty} env property is empty, resolving to default ${this.defaultBrokerServerName}`);
            return this.defaultBrokerServerName;
        }
        return serverName as string;
    }

    private getAppInstanceId(): UniqueId {
        const instanceId = process.env[this.instanceIdEnvProperty];
        this.log.debug(`Received instance ID ${instanceId}`);
        if (!instanceId) {
            this.log.info('Instance ID not provided by broker, generate new');
            return UniqueId.generateNew();
        }
        return UniqueId.fromString(instanceId);
    }

    private readWebSocketUrl(workingDir: string, serverName: string): Promise<string> {
        const path = `${workingDir}/servers/${serverName}/address`;
        this.log.info(`Reading WS URL from ${path}`);
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    this.log.error('Unable to read file', err);
                    reject(err);
                } else {
                    data = stripBom(data);
                    this.log.debug(`Loaded WS address ${data}`);
                    resolve(data);
                }
            });
        });
    }

}