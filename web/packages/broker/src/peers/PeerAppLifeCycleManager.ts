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

/**
 * Manages one client connection and proxy connections for peer brokers
 */
export class PeerAppLifeCycleManager implements AppLifeCycleManager {

    private readonly log: Logger = LoggerFactory.getLogger("PeerAppLifeCycleManager");

    private readonly heartBitPeriod: number = 300;
    private readonly heartBitTtl: number = 1000;
    // TODO stop on disconnect
    private connectionHeartBitInterval: undefined | number | NodeJS.Timer;

    private onlineConnections: Cache = new InMemoryCache();

    constructor(
        private readonly peerConnectionsService: PeerConnectionsService
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
        // current client's connection, not expiration
        if ((connection as PeerProxyConnection).isProxy) {
            this.log.debug(`Accepted proxy [${connectionStrId}] connection`);
            this.onlineConnections.set(connectionStrId, new CacheEntry(appConnection, this.heartBitTtl, () => this.handleDroppedConnection(appConnection, connectionDropped)));
        } else {
            this.log.debug(`Accepted new [${connectionStrId}] connection`);
            this.log.debug(`Starting to send heart bits for [${connectionStrId}] with [${this.heartBitPeriod} period]`);
            this.connectionHeartBitInterval = this.sendHeartBitsFor(appConnection);
            this.onlineConnections.set(connectionId.toString(), new CacheEntry(appConnection));
        }
        return appConnection;
    }

    public async getOrSpawnConnection(applicationId: string): Promise<ApplicationConnection> {
        return this.getOrSpawnConnectionForOneOf([applicationId]);
    }

    public spawnConnection(applicationId: string): Promise<ApplicationConnection> {
        // TODO
        throw "Not implemented";
    }

    public async getOrSpawnConnectionForOneOf(applicationIds: string[]): Promise<ApplicationConnection> {
        const appConnections = this.getOnlineConnectionsInternal()
            .filter(connection => applicationIds.indexOf(connection.descriptor.applicationId) >= 0);
        return appConnections.length > 0 ? appConnections[0] : this.spawnConnection(applicationIds[0]);
    }

    public async getOnlineConnections(): Promise<ApplicationConnection[]> {
        return this.getOnlineConnectionsInternal();
    }

    private sendHeartBitsFor(connection: ApplicationConnection): number | NodeJS.Timer {
        const heartBit: AppConnectionHeartBit = {
            applicationId: connection.descriptor.applicationId,
            connectionId: connection.descriptor.connectionId.toString(),
            instanceId: connection.descriptor.instanceId
        }
        return setInterval(() => {
            this.peerConnectionsService.sendHeartBit(heartBit);
        }, this.heartBitPeriod);
    }

    private subscribeToHeartBits(): void {
        this.peerConnectionsService.subscribeToConnectionsHearBits({
            next: connectionDescriptor => {
                const connectionStrId = connectionDescriptor.instanceId.toString();
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

    private getOnlineConnectionsInternal(): ApplicationConnection[] {
        return this.onlineConnections.keys()
            .map(k => this.onlineConnections.get<ApplicationConnection>(k))
            .filter(v => !!v)
            .map(c => c as ApplicationConnection);
    }
}

