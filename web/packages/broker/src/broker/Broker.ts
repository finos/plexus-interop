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
import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { StateMaschine, StateMaschineBase, ReadWriteCancellationToken, Logger, LoggerFactory } from "@plexus-interop/common";
import { ServerConnectionFactory } from "../transport/ServerConnectionFactory";
import { InteropMetadata } from "../metadata/InteropMetadata";

enum BrokerState { CREATED, OPEN, CLOSED }

export class Broker {

    private readonly state: StateMaschine<BrokerState>;

    private readonly cancellationToken: ReadWriteCancellationToken = new ReadWriteCancellationToken();

    private readonly log: Logger = LoggerFactory.getLogger("Broker");

    constructor(
        private appLifeCycleManager: AppLifeCycleManager,
        private connectionFactory: ServerConnectionFactory,
        private interopMetadata: InteropMetadata
    ) {
        this.state = this.defineStateMaschine();
        this.log.trace("Created");
        this.start();
    }

    private start(): void {
        this.log.debug("Starting to listen for incoming connections");
        this.connectionFactory.acceptConnections({
            next: this.handleIncomingConnection.bind(this),
            error: e => { },
            complete: () => { }
        });
    }

    private defineStateMaschine(): StateMaschine<BrokerState> {
        return new StateMaschineBase(BrokerState.CREATED, [
            {
                from: BrokerState.CREATED, to: BrokerState.OPEN
            },
            {
                from: BrokerState.OPEN, to: BrokerState.CLOSED, preHandler: async () => this.cancellationToken.cancel("Closed")
            }
        ]);
    }

    private handleIncomingConnection(transportConnection: TransportConnection): void {

    }

}