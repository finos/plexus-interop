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
 */import { AppLifeCycleManager } from "./AppLifeCycleManager";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { ApplicationConnectionDescriptor } from "./ApplicationConnectionDescriptor";
import { ApplicationConnection } from "./ApplicationConnection";
import { PeerEventBus } from "../bus/PeerEventBus";
import { Cache, InMemoryCache, Logger, LoggerFactory, CacheEntry } from "@plexus-interop/common";
import { ApplicationDescriptor } from "./ApplicationDescriptor";

/**
 * Manages one client connection and proxy connections for peer brokers
 */
export class PeerAppLifeCycleManager implements AppLifeCycleManager {

    private readonly log: Logger = LoggerFactory.getLogger("PeerAppLifeCycleManager");

    private readonly heartBitPeriod: number = 300;
    private readonly heartBitTtl: number = 1000;

    private onlineConnections: Cache = new InMemoryCache();

    constructor(
        private readonly peerEventBus: PeerEventBus 
    ) {
        this.subscribeToHeartBits();
    }

    public async acceptConnection(connection: TransportConnection, appDescriptor: ApplicationDescriptor): Promise<ApplicationConnection> {
        const connectionId = UniqueId.generateNew();
        const connectionStrId = connectionId.toString();
        this.log.debug(`New connection [${connectionStrId}] accepted`);
        const {applicationId, instanceId} = appDescriptor;
        const appConnection: ApplicationConnection = {
            descriptor: {
                connectionId,
                applicationId, 
                instanceId
            },  
            connection
        };
        // current client's connection, not expiration
        this.onlineConnections.set(connectionId.toString(), new CacheEntry(appConnection));
        this.log.debug(`Starting to send heart bits for [${connectionStrId}] with [${this.heartBitPeriod} period]`);
        this.sendHeartBitsFor(appConnection);        
        return appConnection;
    }

    public async getOrSpawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor> {
        const appConnections = this.getOnlineConnectionsInternal()
            .filter(connection => connection.applicationId === applicationId);
        return appConnections.length > 0 ? appConnections[0] : this.spawnConnection(applicationId);
    }

    public spawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor> {
        // TODO
        throw "Not implemented";
    }

    public async getOnlineConnections(): Promise<ApplicationConnectionDescriptor[]> {
        return this.getOnlineConnectionsInternal();
    }

    private sendHeartBitsFor(connection: ApplicationConnection): void {
        // TODO when to stop?
        setTimeout(() => {
            this.peerEventBus.sendHeartBit(connection.descriptor);
        }, this.heartBitPeriod);
    }

    private subscribeToHeartBits(): void {
        this.peerEventBus.onConnectionHeartBit(connectionDescriptor => {
            const connectionStrId = connectionDescriptor.instanceId.toString();
            if (this.onlineConnections.has(connectionStrId)) {
                // app still with us
                this.onlineConnections.resetTtl(connectionStrId);
            } else {
                // app just connected or reconnected
                // TODO handle reconnection
                // TODO create proxy connection and put it here
            }
        });
    }

    private getOnlineConnectionsInternal(): ApplicationConnectionDescriptor[] {
        return this.onlineConnections.keys()
            .map(k => this.onlineConnections.get<ApplicationConnection>(k))
            .filter(v => !!v)
            .map(connection => (connection as ApplicationConnection).descriptor);
    }
}

