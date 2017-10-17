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
import { MessageFrame, ConnectionOpenFrame, ConnectionCloseFrame } from "./model";
import { ChannelOpenFrame, ChannelCloseFrame } from "./model";
import { ConnectableFramedTransport } from "./ConnectableFramedTransport";
import { TransportConnection } from "../TransportConnection";
import { FramedTransportChannel } from "./FramedTransportChannel";
import { BufferedTransportProxy } from "./BufferedTransportProxy";
import { TransportChannel } from "../TransportChannel";
import { UniqueId } from "../UniqueId";
import { transportProtocol as plexus } from "@plexus-interop/protocol";
import { TransportFrameHandler } from "./TransportFrameHandler";
import { ChannelsHolder } from "../../common/ChannelsHolder";
import { BufferedChannelsHolder } from "../../common/BufferedChannelsHolder";
import { StateMaschineBase, StateMaschine, CancellationToken, LoggerFactory, Logger } from "@plexus-interop/common";

export type ConnectionState = "CREATED" | "ACCEPT" | "OPEN" | "CLOSE_RECEIVED" | "CLOSE_REQUESTED" | "CLOSED";

export const ConnectionState = {
    CREATED: "CREATED" as ConnectionState,
    ACCEPT: "ACCEPT" as ConnectionState,
    OPEN: "OPEN" as ConnectionState,
    CLOSE_RECEIVED: "CLOSE_RECEIVED" as ConnectionState,
    CLOSE_REQUESTED: "CLOSE_REQUESTED" as ConnectionState,
    CLOSED: "CLOSED" as ConnectionState
};

type ChannelDescriptor = {
    channel: FramedTransportChannel,
    channelTransportProxy: BufferedTransportProxy
};

export class FramedTransportConnection extends TransportFrameHandler implements TransportConnection {

    private log: Logger;

    public readCancellationToken: CancellationToken = new CancellationToken();
    public writeCancellationToken: CancellationToken = new CancellationToken();

    private channelsHolder: ChannelsHolder<TransportChannel, ChannelDescriptor> = new BufferedChannelsHolder<TransportChannel, ChannelDescriptor>();

    private readonly stateMachine: StateMaschine<ConnectionState>;

    constructor(private framedTransport: ConnectableFramedTransport) {
        super();
        this.log = LoggerFactory.getLogger(`FramedTransportConnection [${this.uuid().toString()}]`);
        this.stateMachine = this.createStateMaschine();
        this.log.debug("Created");
    }

    public async disconnect(completion?: plexus.ICompletion): Promise<void> {
        switch (this.stateMachine.getCurrent()) {
            case ConnectionState.OPEN:
                this.log.debug("Current state is OPEN, requesting connection close");
                await this.stateMachine.goAsync(ConnectionState.CLOSE_REQUESTED, {
                    preHandler: async () => {
                        await this.sendConnectionCloseMessage(completion);
                    }
                });
                break;
            case ConnectionState.CLOSE_RECEIVED:
                this.log.debug("Current state is CLOSE_RECEIVED, closing all");
                await this.sendConnectionCloseMessage(completion);
                this.closeAndCleanUp();
                break;
            default:
                throw new Error(`Can't close, invalid state ${this.stateMachine.getCurrent()}`);
        }
    }

    public waitForChannel(cancellationToken: CancellationToken = new CancellationToken()): Promise<TransportChannel> {
        this.stateMachine.throwIfNot(ConnectionState.OPEN);
        return this.channelsHolder.waitForIncomingChannel(cancellationToken);
    }

    public getManagedChannels(): TransportChannel[] {
        const result: TransportChannel[] = [];
        this.channelsHolder.getChannels().forEach(value => {
            result.push(value.channel);
        });
        return result;
    }

    public async createChannel(): Promise<TransportChannel> {
        this.stateMachine.throwIfNot(ConnectionState.OPEN);
        const uuid = UniqueId.generateNew();
        const { channel } = this.createOutChannel(uuid);
        this.framedTransport.writeFrame(ChannelOpenFrame.fromHeaderData({
            channelId: uuid
        }));
        return channel;
    }

    public uuid(): UniqueId {
        return this.framedTransport.uuid();
    }

    public async open(): Promise<void> {
        this.log.debug("Opening connection");
        return this.stateMachine.goAsync(ConnectionState.OPEN);
    }

    public async acceptingConnection(): Promise<void> {
        this.log.debug("Accepting connection");
        return this.stateMachine.goAsync(ConnectionState.ACCEPT);
    }

    private createStateMaschine(): StateMaschine<ConnectionState> {
        return new StateMaschineBase<ConnectionState>(ConnectionState.CREATED, [
            // initializing connection
            {
                from: ConnectionState.CREATED, to: ConnectionState.OPEN,
                preHandler: this.openConnectionInternal.bind(this),
                postHandler: async () => {
                    this.listenForIncomingFrames();
                }
            },
            // accepting connection
            {
                from: ConnectionState.CREATED, to: ConnectionState.ACCEPT,
                postHandler: async () => {
                    this.listenForIncomingFrames();
                }
            },
            // connection accepted
            {
                from: ConnectionState.ACCEPT, to: ConnectionState.OPEN,
                preHandler: this.openConnectionInternal.bind(this)
            },
            // closing connection message requested
            {
                from: ConnectionState.OPEN, to: ConnectionState.CLOSE_REQUESTED
            },
            // forced connection closure
            {
                from: ConnectionState.OPEN, to: ConnectionState.CLOSED
            },
            {
                from: ConnectionState.CLOSE_RECEIVED, to: ConnectionState.CLOSED
            },
            {
                from: ConnectionState.OPEN, to: ConnectionState.CLOSE_RECEIVED, preHandler: async () => {
                    this.readCancellationToken.cancel("Connection close received");
                }
            },
            // graceful connection closure
            {
                from: ConnectionState.CLOSE_REQUESTED, to: ConnectionState.CLOSED
            }
        ]);
    }

    private async sendConnectionCloseMessage(completion?: plexus.ICompletion): Promise<void> {
        this.log.debug("Requesting close connection");
        this.framedTransport.writeFrame(ConnectionCloseFrame.fromHeaderData({ completion }));
    }

    private async openConnectionInternal(): Promise<void> {
        this.log.trace("Opening connection");
        const id = this.framedTransport.uuid();
        this.framedTransport.writeFrame(
            ConnectionOpenFrame.fromHeaderData({
                connectionId: id
            }));
    }

    public closeAndCleanUp(): void {
        if (this.stateMachine.is(ConnectionState.CLOSED)) {
            this.log.warn("Already closed");
            return;
        }
        if (this.log.isDebugEnabled()) {
            this.log.debug(`Closing connection, current state is ${this.stateMachine.getCurrent()}`);
        }
        this.writeCancellationToken.cancel("Connection is closed");
        this.readCancellationToken.cancel("Connection is closed");
        this.stateMachine.go(ConnectionState.CLOSED);
        this.channelsHolder.getChannels().forEach((value, key: string) => {
            this.log.debug(`Cleaning channel ${key}`);
            value.channel.closeInternal();
            value.channelTransportProxy.clear();
        });
        this.channelsHolder.clearAll();
        this.disconnectFromSource()
            .catch(e => this.log.error("Failed to disconnect from source", e));
    }

    private async disconnectFromSource(): Promise<void> {
        this.log.debug("Disconnecting from source transport");
        return this.framedTransport
            .disconnect()
            .then(() => {
                this.log.debug("Transport disconnected");
            }, (error) => {
                this.log.error("Transport disconnect error", error);
            });
    }

    private async listenForIncomingFrames(): Promise<void> {
        this.log.debug("Start listening of incoming frames");
        this.framedTransport.open({
            next: (frame) => {
                if (this.stateMachine.isOneOf(
                    ConnectionState.CLOSE_REQUESTED,
                    ConnectionState.OPEN,
                    ConnectionState.ACCEPT)) {
                    this.handleFrame(frame, this.log);
                } else {
                    this.log.warn("Not connected, dropping frame");
                }
            },
            error: (transportError) => {
                this.log.error("Error from source transport", transportError);
                this.reportErrorToChannels(transportError);
                this.closeAndCleanUp();
            },
            complete: () => {
                this.log.debug("Source connection completed");
                this.closeAndCleanUp();
            }
        });
    }

    public async handleConnectionCloseFrame(frame: ConnectionCloseFrame): Promise<void> {
        const completion = frame.getHeaderData().completion as plexus.ICompletion;
        if (this.log.isDebugEnabled()) {
            this.log.debug("Received connection close", JSON.stringify(completion));
        }
        switch (this.stateMachine.getCurrent()) {
            case ConnectionState.OPEN:
                this.log.debug("Close received, waiting for client to close it");
                this.stateMachine.go(ConnectionState.CLOSE_RECEIVED);
                break;
            case ConnectionState.CLOSE_REQUESTED:
                this.log.debug("Close already requested, closing connection");
                this.closeAndCleanUp();
                break;
            default:
                throw new Error(`Can't handle close, invalid state ${this.stateMachine.getCurrent()}`);
        }
    }

    public handleChannelOpenFrame(frame: ChannelOpenFrame): void {
        this.log.trace("Received channel open frame");
        const channelId = UniqueId.fromProperties(frame.getHeaderData().channelId as plexus.IUniqueId);
        this.log.debug(`Received open channel request ${channelId}`);
        if (!this.channelsHolder.channelExists(channelId.toString())) {
            this.createInChannel(channelId);
        } else {
            this.log.warn(`Channel ${channelId.toString()} already exist`);
        }
    }

    public handleChannelCloseFrame(frame: ChannelCloseFrame): void {
        const channelId = UniqueId.fromProperties(frame.getHeaderData().channelId as plexus.IUniqueId);
        const strChannelId = channelId.toString();
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Received channel close frame, channelId ${strChannelId}`);
        }
        if (this.channelsHolder.channelExists(strChannelId)) {
            const channelDescriptor = this.channelsHolder.getChannelDescriptor(strChannelId);
            this.log.debug("Pass close frame to channel", strChannelId);
            channelDescriptor.channelTransportProxy.next(frame);
            channelDescriptor.channelTransportProxy.complete();
        } else {
            this.log.warn(`Received close channel frame for not existing uuid ${strChannelId}`);
        }
    }

    public handleConnectionOpenFrame(frame: ConnectionOpenFrame): void {
        this.log.trace("Received connection open frame");
        if (this.stateMachine.is(ConnectionState.OPEN)) {
            this.log.debug(`Received connection open confimation`);
        } else if (this.stateMachine.is(ConnectionState.ACCEPT)) {
            this.log.debug(`Received connection open request`);
            this.stateMachine.go(ConnectionState.OPEN);
        }
    }

    public getIncomingChannelsSize(): number {
        return this.channelsHolder.getIncomingChannelsSize();
    }

    public handleMessageFrame(frame: MessageFrame): void {
        const channelIdProps = frame.getHeaderData().channelId as plexus.IUniqueId;
        const channelId = UniqueId.fromProperties(channelIdProps);
        const strChannelId = channelId.toString();
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Received message frame, channelId ${strChannelId}`);
        }
        const channelExists = this.channelsHolder.channelExists(strChannelId);
        if (!channelExists) {
            // not first frame, however no buffer exist
            this.log.error(`Dropped frame, no incoming buffer exist for ${strChannelId}`);
        } else {
            // add frame to incoming buffer
            if (this.log.isDebugEnabled()) {
                this.log.debug(`Received data frame for channel ${strChannelId}`);
            }
            const channelDescriptor = this.channelsHolder.getChannelDescriptor(strChannelId);
            channelDescriptor.channelTransportProxy.next(frame);
        }
        if (frame.isLast()) {
            if (this.log.isTraceEnabled()) {
                this.log.trace(`Received last frame for message of channel ${strChannelId}`);
            }
        }
    }

    private reportErrorToChannels(error: any): void {
        this.channelsHolder.getChannels().forEach((value, key: string) => {
            value.channelTransportProxy.error(error);
        });
    }

    private createOutChannel(channelId: UniqueId): ChannelDescriptor {
        return this.createChannelInternal(channelId, false);
    }

    private createInChannel(channelId: UniqueId): ChannelDescriptor {
        return this.createChannelInternal(channelId, true);
    }

    private createChannelInternal(channelId: UniqueId, isIncomingChannel: boolean): ChannelDescriptor {
        const strChannelId = channelId.toString();
        this.log.debug(`Creating new channel ${strChannelId}`);
        const proxyLogger = LoggerFactory.getLogger(`ChannelTranportProxy [${strChannelId}]`);
        const channelTransportProxy = new BufferedTransportProxy(this.framedTransport, this.writeCancellationToken, proxyLogger);
        const dispose = async () => {
            this.log.debug(`Dispose called on ${strChannelId} channel`);
            if (this.channelsHolder.channelExists(strChannelId)) {
                const channelDescriptor = this.channelsHolder.getChannelDescriptor(strChannelId);
                channelDescriptor.channelTransportProxy.clear();
                this.channelsHolder.clear(strChannelId);
            }
        };
        const channel = new FramedTransportChannel(channelId, channelTransportProxy, dispose, this.readCancellationToken);
        this.channelsHolder.addChannelDescriptor(strChannelId, { channel, channelTransportProxy });
        if (isIncomingChannel) {
            this.channelsHolder.enqueueIncomingChannel(channel);
        }
        return { channel, channelTransportProxy };
    }

}