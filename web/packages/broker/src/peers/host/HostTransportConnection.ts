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
import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { Observer, Logger, LoggerFactory, Subscription, stringToArrayBuffer } from "@plexus-interop/common";
import { UniqueId, clientProtocol } from "@plexus-interop/protocol";
import { RemoteBrokerService } from "../remote/RemoteBrokerService";
import { RemoteActions } from "../actions/RemoteActions";
import { CreateChannelResponse } from "../actions/CreateChannelResponse";
import { Observable } from "rxjs/Observable";
import { ChannelRequest } from "../actions/ChannelRequest";
import { SendMessageRequest } from "../actions/SendMessageRequest";
import { CloseChannelRequest } from "../actions/CloseChannelRequest";
import { CloseChannelResponse } from "../actions/CloseChannelResponse";
import { Types } from "../../util/Types";

export type DisconnectListener = (completion?: clientProtocol.ICompletion) => void;

export class HostTransportConnection implements TransportConnection {

    private readonly disconnectListeners: DisconnectListener[] = [];

    private readonly stringUuid: string;

    private readonly log: Logger;

    public constructor(
        private readonly baseConnection: TransportConnection,
        private readonly remoteBrokerService: RemoteBrokerService) {
        this.stringUuid = this.uuid().toString();
        this.log = LoggerFactory.getLogger(`HostTransportConnection [${this.stringUuid}]`);
        this.bindToRemoteActions();
    }

    public connect(channelObserver: Observer<TransportChannel>): Promise<void> {
        return this.baseConnection.connect(channelObserver);
    }

    public subscribeToChannels(channelObserver: Observer<TransportChannel>): Subscription {
        return this.baseConnection.subscribeToChannels(channelObserver);
    }

    public isConnected(): boolean {
        return this.baseConnection.isConnected();
    }

    public uuid(): UniqueId {
        return this.baseConnection.uuid();
    }

    public getManagedChannels(): TransportChannel[] {
        return this.baseConnection.getManagedChannels();
    }

    public getManagedChannel(id: string): TransportChannel | undefined {
        return this.baseConnection.getManagedChannel(id);
    }

    public onDisconnect(disconnectListener: DisconnectListener): void {
        this.disconnectListeners.push(disconnectListener);
    }

    public disconnect(completion?: clientProtocol.ICompletion): Promise<void> {
        this.log.trace("Disconnect requested, passing to listeners");
        this.disconnectListeners.forEach(l => l(completion));
        this.log.trace("Disconnecting from base connection");
        return this.baseConnection.disconnect(completion);
    }

    public createChannel(): Promise<TransportChannel> {
        return this.baseConnection.createChannel();
    }

    private bindToRemoteActions(): void {

        this.log.info("Binding to remote actions");

        this.remoteBrokerService.host<{}, CreateChannelResponse>(RemoteActions.CREATE_CHANNEL, (request, responseObserver) => {
            return new Observable(observer => {
                this.log.trace("Create channel request received");
                this.createChannel()
                    .then(channel => {
                        observer.next({ id: channel.uuid().toString() });
                        observer.complete();
                    })
                    .catch(e => observer.error(Types.toClientError(e)));
            }).subscribe(responseObserver);
        }, this.stringUuid);

        this.remoteBrokerService.host<ChannelRequest, ArrayBuffer>(RemoteActions.OPEN_CHANNEL, (request: ChannelRequest, responseObserver) => {
            return new Observable(observer => {
                debugger;                
                const channel = this.getManagedChannel(request.channelId);
                this.log.trace(`Open Channel [${request.channelId}] request received`);
                if (channel) {
                    channel.open({
                        started: () => { },
                        startFailed: e => observer.error(e),
                        next: msg => observer.next(msg),
                        complete: () => observer.complete(),
                        error: e => observer.error(Types.toClientError(e))
                    });
                } else {
                    observer.error(`No channel with id [${request.channelId}]`);
                }
            }).subscribe(responseObserver);
        }, this.stringUuid);

        this.remoteBrokerService.host<SendMessageRequest, {}>(RemoteActions.SEND_MESSAGE, (request: SendMessageRequest, responseObserver) => {
            return new Observable(observer => {
                debugger;
                if (this.log.isTraceEnabled()) {
                    this.log.trace(`Send Message of [${request.messagePayload.length}] length for [${request.channelId}] channel received`);
                }
                const channel = this.getManagedChannel(request.channelId);
                if (channel) {
                    channel.sendMessage(stringToArrayBuffer(request.messagePayload))
                        .then(() => observer.complete())
                        .catch(e => observer.error(Types.toClientError(e)));
                } else {
                    observer.error(`No channel with id [${request.channelId}]`);
                }
            }).subscribe(responseObserver);
        }, this.stringUuid);

        this.remoteBrokerService.host<CloseChannelRequest, CloseChannelResponse>(RemoteActions.CLOSE_CHANNEL, (request: CloseChannelRequest, responseObserver) => {
            return new Observable(observer => {
                debugger;                
                this.log.trace(`Close channel [${request.channelId}] received`);
                const channel = this.getManagedChannel(request.channelId);
                if (channel) {
                    channel.close(request.completion)
                        .then(completion => {
                            observer.next({ completion });
                            observer.complete();
                        })
                        .catch(e => observer.error(Types.toClientError(e)));
                } else {
                    observer.error(`No channel with id [${request.channelId}]`);
                }
            }).subscribe(responseObserver);

        }, this.stringUuid);

    }
}