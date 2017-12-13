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
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { TransportConnection } from "@plexus-interop/transport-common";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";
import { Cache, InMemoryCache, Logger, LoggerFactory, CacheEntry } from "@plexus-interop/common";
import { ApplicationDescriptor } from "../lifecycle/ApplicationDescriptor";
import { PeerProxyConnection } from "../peers/PeerProxyConnection";
import { PeerConnectionsService } from "./PeerConnectionsService";
import { AppConnectionHeartBit } from "./events/AppConnectionHeartBit";
import { AppRegistryService } from "../metadata/apps/AppRegistryService";
import { AppLauncherRegistry } from "../launcher/AppLauncherRegistry";
import { CancellationToken } from "@plexus-interop/common";
import { UniqueId } from "@plexus-interop/protocol";
import { AsyncHelper } from "@plexus-interop/common";
import { HostTransportConnection } from "./host/HostTransportConnection";

/**
 * Manages one client connection and proxy connections for peer brokers
 */
export class PeerAppLifeCycleManager implements AppLifeCycleManager {

    private readonly log: Logger = LoggerFactory.getLogger("PeerAppLifeCycleManager");

    // time to wait for application to start before rejecting broker's request
    private readonly spawnConnectionTimeout: number = 5 * 60 * 1000;

    private onlineConnections: Cache = new InMemoryCache();

    constructor(
        private readonly peerConnectionsService: PeerConnectionsService,
        private readonly appRegistryService: AppRegistryService,
        private readonly launcherRegistry: AppLauncherRegistry,
        private readonly heartBitPeriod: number,
        private readonly heartBitTtl: number
    ) {
        this.subscribeToHeartBits();
    }

    public async acceptConnection(connection: TransportConnection, appDescriptor: ApplicationDescriptor, connectionDropped: (connection: ApplicationConnection) => void): Promise<ApplicationConnection> {
        const connectionId = connection.uuid();
        const connectionStrId = connectionId.toString();
        const { applicationId, instanceId } = appDescriptor;
        const appConnection: ApplicationConnection = {
            descriptor: {
                connectionId,
                applicationId,
                instanceId
            },
            connection
        };
        if ((connection as PeerProxyConnection).isProxy) {
            this.log.debug(`Accepted proxy [${connectionStrId}] connection`);
            const connectionCacheEntry = new CacheEntry(appConnection, this.heartBitTtl, () => this.handleDroppedConnection(appConnection, connectionDropped));
            this.onlineConnections.set(connectionStrId, connectionCacheEntry);
        } else if ((connection as HostTransportConnection).onDisconnect) {
            this.log.debug(`Accepted host [${connectionStrId}] connection`);
            this.log.debug(`Starting to send heart bits for [${connectionStrId}] with [${this.heartBitPeriod}] period`);
            const connectionHeartBitInterval = this.sendHeartBitsFor(appConnection);
            const hostConnection = connection as HostTransportConnection;
            hostConnection.onDisconnect(() => {
                this.log.debug(`Stopping heart bits for [${connectionStrId}]`);
                clearInterval(connectionHeartBitInterval);
            });
            this.onlineConnections.set(connectionId.toString(), new CacheEntry(appConnection));
        } else {
            throw new Error("Unsupported Transport Connection Type");
        }
        return appConnection;
    }

    public async getOrSpawnConnection(applicationId: string): Promise<ApplicationConnection> {
        return this.getOrSpawnConnectionForOneOf([applicationId]);
    }

    public async spawnConnection(applicationId: string): Promise<ApplicationConnection> {
        this.log.debug(`Spawning instance for [${applicationId}] app`);
        const app = this.appRegistryService.getApplication(applicationId);
        this.log.debug(`App [${applicationId}] found in registry`);
        const appLauncher = this.launcherRegistry.getAppLauncher(app.launcherId);
        this.log.debug(`App Launcher found for [${applicationId}] app, launching ... `);
        const cancellationToken = new CancellationToken();
        const appLaunchResponse = await appLauncher.launch({
            cancellationToken
        }, {
                appId: applicationId,
                launchParams: app.launcherParams
            });
        this.log.debug(`Waiting for application [${applicationId}] id with instance id [${appLaunchResponse.appInstanceId.toString()}] to connect`);
        try {
            await AsyncHelper.waitFor(() => this.isInstanceConnected(appLaunchResponse.appInstanceId),
                new CancellationToken(), this.heartBitPeriod, this.spawnConnectionTimeout);
            const launchedAppInstanceId = appLaunchResponse.appInstanceId.toString();
            this.log.debug(`App [${applicationId}] id, instance id [${launchedAppInstanceId}] is connected`);
            return this.getOnlineConnectionsInternal()
                .find(appConnection => appConnection.descriptor.instanceId === launchedAppInstanceId) as ApplicationConnection;
        } catch (e) {
            this.log.error(`Failed to wait for [${appLaunchResponse.appInstanceId.toString()}] instance to start`, e);
            cancellationToken.cancel(`Time out ${this.spawnConnectionTimeout} passed`);
            throw e;
        }
    }

    public async getOrSpawnConnectionForOneOf(applicationIds: string[]): Promise<ApplicationConnection> {
        const appConnections = this.getOnlineConnectionsInternal()
            .filter(connection => applicationIds.indexOf(connection.descriptor.applicationId) >= 0);
        return appConnections.length > 0 ? appConnections[0] : this.spawnConnection(applicationIds[0]);
    }

    public async getOnlineConnections(): Promise<ApplicationConnection[]> {
        return this.getOnlineConnectionsInternal();
    }

    private sendHeartBitsFor(connection: ApplicationConnection): NodeJS.Timer {
        const heartBit: AppConnectionHeartBit = {
            applicationId: connection.descriptor.applicationId,
            connectionId: connection.descriptor.connectionId.toString(),
            instanceId: connection.descriptor.instanceId
        };
        this.peerConnectionsService.sendHeartBit(heartBit);
        return setInterval(() => {
            this.peerConnectionsService.sendHeartBit(heartBit);
        }, this.heartBitPeriod);
    }

    private subscribeToHeartBits(): void {
        this.log.trace("Subscribing to app heartbits");
        this.peerConnectionsService.subscribeToConnectionsHearBits({
            next: connectionDescriptor => {
                const connectionStrId = connectionDescriptor.connectionId;
                if (this.onlineConnections.has(connectionStrId)) {
                    // app still with us
                    this.onlineConnections.resetTtl(connectionStrId);
                }
            }
        });
    }

    private handleDroppedConnection(appConnection: ApplicationConnection, listener: (connection: ApplicationConnection) => void): void {
        this.log.error(`Connection [${appConnection.descriptor.connectionId}] dropped`);
        listener(appConnection);
    }

    private isInstanceConnected(instanceId: UniqueId): boolean {
        return this.getOnlineConnectionsInternal()
            .filter(appConnection => appConnection.descriptor.instanceId.toString() === instanceId.toString())
            .length > 0;
    }

    private getOnlineConnectionsInternal(): ApplicationConnection[] {
        return this.onlineConnections.keys()
            .map(k => this.onlineConnections.get<ApplicationConnection>(k))
            .filter(v => !!v)
            .map(c => c as ApplicationConnection);
    }
}

