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
import { Observer, Subscription, Logger, LoggerFactory, BufferedObserver, AnonymousSubscription } from "@plexus-interop/common";
import { TransportConnection, UniqueId, ServerConnectionFactory } from "@plexus-interop/transport-common";
import { AppConnectionHeartBit } from "../peers/events/AppConnectionHeartBit";
import { PeerConnectionsService } from "../peers/PeerConnectionsService";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { PeerProxyConnection } from "../peers/PeerProxyConnection";
import { RemoteBrokerService } from "./remote/RemoteBrokerService";

export class PeerServerConnectionFactory implements ServerConnectionFactory {

    private readonly log: Logger;

    private readonly processedConnections: Set<string> = new Set();

    private readonly connectionsObserver: BufferedObserver<TransportConnection>;

    constructor(
        private readonly hostConnectionGuid: string,
        private readonly peerConnectionsService: PeerConnectionsService,
        private readonly remoteBrokerService: RemoteBrokerService) {
        this.log = LoggerFactory.getLogger("PeerServerConnectionFactory");
        this.connectionsObserver = new BufferedObserver(100, this.log);
        this.listenForPeerConnections();
    }

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        this.connectionsObserver.setObserver(connectionsObserver);
        return new AnonymousSubscription();
    }

    private listenForPeerConnections(): void {
        this.log.debug("Starting to listen for connections");
        this.peerConnectionsService.subscribeToConnectionsHearBits({
            next: (connectionDescriptor: AppConnectionHeartBit) => {
                // create proxy connection only once
                if (!this.processedConnections.has(connectionDescriptor.connectionId)
                    && connectionDescriptor.connectionId !== this.hostConnectionGuid) {
                    this.log.debug(`Detected new connection, app id ${connectionDescriptor.applicationId} [${connectionDescriptor.connectionId}]`);
                    this.processedConnections.add(connectionDescriptor.connectionId);
                    const appConnectionDescriptor: ApplicationConnectionDescriptor = {
                        applicationId: connectionDescriptor.applicationId,
                        instanceId: connectionDescriptor.instanceId,
                        connectionId: UniqueId.fromString(connectionDescriptor.connectionId)
                    };
                    this.connectionsObserver.next(new PeerProxyConnection(connectionDescriptor.connectionId, appConnectionDescriptor, this.remoteBrokerService));
                }
            }
        });
    }

}