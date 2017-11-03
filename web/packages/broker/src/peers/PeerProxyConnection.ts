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

export class PeerProxyConnection implements TransportConnection {

    private readonly log: Logger;

    public readonly isProxy: boolean = true;

    private readonly channelsObserver: BufferedObserver<TransportChannel>;

    constructor(private readonly connectionDescriptor: ApplicationConnectionDescriptor) {
        this.log = LoggerFactory.getLogger(`PeerProxyConnection [${connectionDescriptor.connectionId.toString()}]`);
        this.channelsObserver = new BufferedObserver<TransportChannel>(Defaults.DEFAULT_BUFFER_SIZE, this.log);
        // send authentication handler as first incoming channel
        this.channelsObserver.next(new ProxyAuthenticationHandler(connectionDescriptor));
    }

    public async open(channelObserver: Observer<TransportChannel>): Promise<void> {
        this.log.debug(`Broker subscribed to channels`);
        this.channelsObserver.setObserver(channelObserver);
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

    public createChannel(): Promise<TransportChannel> {
        throw "Not implemented";
    }

}