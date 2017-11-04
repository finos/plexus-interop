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
import { TransportConnection, TransportChannel, UniqueId, Defaults } from "@plexus-interop/transport-common";
import { Observer, BufferedObserver, Logger, LoggerFactory } from "@plexus-interop/common";
import { clientProtocol } from "@plexus-interop/protocol";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { ProxyAuthenticationHandler } from "./ProxyAuthenticationHandler";
import { PeerTransport } from "./PeerTransport";
import { RemoteActions } from "./actions/RemoteActions";
import { PeerProxyTransportChannel } from "./PeerProxyTransportChannel";

export class PeerProxyConnection implements TransportConnection {

    private readonly log: Logger;

    public readonly isProxy: boolean = true;

    private readonly incomingChannelsObserver: BufferedObserver<TransportChannel>;

    private readonly remoteConnectionId: string;

    constructor(
        private hostConnectionId: string,
        private readonly connectionDescriptor: ApplicationConnectionDescriptor,
        private readonly peerTransport: PeerTransport) {
        
        this.remoteConnectionId = connectionDescriptor.connectionId.toString();
        this.log = LoggerFactory.getLogger(`PeerProxyConnection [${connectionDescriptor.connectionId.toString()}]`);
        this.incomingChannelsObserver = new BufferedObserver<TransportChannel>(Defaults.DEFAULT_BUFFER_SIZE, this.log);
        this.incomingChannelsObserver.next(new ProxyAuthenticationHandler(connectionDescriptor));

    }

    public async open(channelObserver: Observer<TransportChannel>): Promise<void> {
        this.log.debug(`Broker subscribed to channels`);
        this.incomingChannelsObserver.setObserver(channelObserver);
    }

    public uuid(): UniqueId {
        return this.connectionDescriptor.connectionId;
    }

    public getManagedChannels(): TransportChannel[] {
        throw "getManagedChannels Not implemented";
    }

    public disconnect(completion?: clientProtocol.ICompletion): Promise<void> {
        throw "disconnect Not implemented";
    }

    public async createChannel(): Promise<TransportChannel> {
        this.log.debug("Received create channel request");
        const response = await this.peerTransport.sendUnary(this.remoteConnectionId, RemoteActions.CREATE_CHANNEL, {});
        return new PeerProxyTransportChannel(response.id, this.remoteConnectionId, this.peerTransport);
    }

}