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
import { DuplexConnectionFactory } from "./DuplexConnectionFactory";
import { Observer, Subscription, BufferedObserver, Logger, LoggerFactory, AnonymousSubscription } from "@plexus-interop/common";
import { TransportConnection, Defaults, Frame, FramedTransportConnection } from "../.";
import { InMemoryFramedTransport } from "./InMemoryFramedTransport";

/**
 * Creates pair of coupled in memory connections for each Client's connect request
 */
export class InMemoryConnectionFactory implements DuplexConnectionFactory {

    private readonly log: Logger = LoggerFactory.getLogger("InMemoryConnectionFactory");

    private serverConnectionsObserver: BufferedObserver<TransportConnection> =
        new BufferedObserver<TransportConnection>(Defaults.DEFAULT_BUFFER_SIZE, this.log);

    public async connect(): Promise<TransportConnection> {
        const [client] = await this.connectBoth();
        return client;
    }

    public async connectBoth(): Promise<[TransportConnection, TransportConnection]> {
        const clientInObserver: BufferedObserver<Frame> = new BufferedObserver(Defaults.DEFAULT_BUFFER_SIZE, this.log);
        const serverInObserver: BufferedObserver<Frame> = new BufferedObserver(Defaults.DEFAULT_BUFFER_SIZE, this.log);

        const serverTransportConnection =
            new FramedTransportConnection(new InMemoryFramedTransport(serverInObserver, clientInObserver));

        const clientTransportConnection =
            new FramedTransportConnection(new InMemoryFramedTransport(clientInObserver, serverInObserver));

        if (this.log.isDebugEnabled()) {
            this.log.debug(`Created pair of connections: 
                Client [${clientTransportConnection.uuid().toString()}] 
                Server [${serverTransportConnection.uuid().toString()}]`);
        }
        
        await clientTransportConnection.connect();
        await serverTransportConnection.acceptingConnection();

        this.serverConnectionsObserver.next(serverTransportConnection);
        
        return [clientTransportConnection, serverTransportConnection];
    }

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        this.log.debug("Received accept connections request");
        this.serverConnectionsObserver.setObserver(connectionsObserver);
        return new AnonymousSubscription();
    }

}