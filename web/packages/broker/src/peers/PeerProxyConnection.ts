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
import { Observer, BufferedObserver, Logger, LoggerFactory, Subscription, AnonymousSubscription } from "@plexus-interop/common";
import { clientProtocol } from "@plexus-interop/protocol";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { ProxyAuthenticationHandler } from "./ProxyAuthenticationHandler";
import { RemoteActions } from "./actions/RemoteActions";
import { PeerProxyTransportChannel } from "./PeerProxyTransportChannel";
import { RemoteBrokerService } from "./remote/RemoteBrokerService";

export class PeerProxyConnection implements TransportConnection {

    private readonly log: Logger;

    public readonly isProxy: boolean = true;

    private readonly incomingChannelsObserver: BufferedObserver<TransportChannel>;

    private readonly remoteConnectionId: string;

    constructor(
        private hostConnectionId: string,
        private readonly connectionDescriptor: ApplicationConnectionDescriptor,
        private readonly remoteBrokerService: RemoteBrokerService) {
        this.remoteConnectionId = connectionDescriptor.connectionId.toString();
        this.log = LoggerFactory.getLogger(`PeerProxyConnection [${connectionDescriptor.connectionId.toString()}]`);
        this.incomingChannelsObserver = new BufferedObserver<TransportChannel>(Defaults.DEFAULT_BUFFER_SIZE, this.log);
        this.incomingChannelsObserver.next(new ProxyAuthenticationHandler(connectionDescriptor));
    }

    public async connect(channelObserver: Observer<TransportChannel>): Promise<void> {
        this.log.debug(`Broker subscribed to channels via connect`);
        this.incomingChannelsObserver.setObserver(channelObserver);
    }

    public subscribeToChannels(channelObserver: Observer<TransportChannel>): Subscription {
        this.log.debug(`Broker subscribed to channels via subscibe`);
        this.incomingChannelsObserver.setObserver(channelObserver);
        return new AnonymousSubscription();
    }

    public uuid(): UniqueId {
        return this.connectionDescriptor.connectionId;
    }

    public getManagedChannel(): TransportChannel | undefined {
        throw "getManagedChannel Not implemented";
    }

    public getManagedChannels(): TransportChannel[] {
        throw "getManagedChannels Not implemented";
    }

    public isConnected(): boolean {
        this.log.trace("isConnected called");
        return true;
    }

    public async disconnect(completion?: clientProtocol.ICompletion): Promise<void> {
        this.log.info("Disconnect called", completion);
    }

    public async createChannel(): Promise<TransportChannel> {
        this.log.debug("Received create channel request");
        const response = await this.remoteBrokerService.invokeUnary(RemoteActions.CREATE_CHANNEL, {}, this.remoteConnectionId);
        return new PeerProxyTransportChannel(response.id, this.remoteConnectionId, this.remoteBrokerService);
    }

}