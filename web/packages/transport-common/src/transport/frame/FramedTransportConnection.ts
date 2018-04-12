/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { MessageFrame, ConnectionOpenFrame, ConnectionCloseFrame } from './model';
import { ChannelOpenFrame, ChannelCloseFrame } from './model';
import { ConnectableFramedTransport } from './ConnectableFramedTransport';
import { TransportConnection } from '../TransportConnection';
import { FramedTransportChannel } from './FramedTransportChannel';
import { BufferedTransportProxy } from './BufferedTransportProxy';
import { TransportChannel } from '../TransportChannel';
import { UniqueId, ClientProtocolUtils, ClientError, SuccessCompletion } from '@plexus-interop/protocol';
import { transportProtocol as plexus } from '@plexus-interop/protocol';
import { TransportFrameHandler } from './TransportFrameHandler';
import { StateMaschineBase, StateMaschine, LoggerFactory, Logger, ReadWriteCancellationToken, Observer, BufferedObserver, Subscription, AnonymousSubscription } from '@plexus-interop/common';
import { TransportFrameListener } from './TransportFrameListener';

export enum ConnectionState {
    CREATED = 'CREATED',
    ACCEPT = 'ACCEPT',
    OPEN = 'OPEN',
    CLOSE_RECEIVED = 'CLOSE_RECEIVED',
    CLOSE_REQUESTED = 'CLOSE_REQUESTED',
    CLOSED = 'CLOSED'
}

type ChannelDescriptor = {
    channel: FramedTransportChannel,
    channelTransportProxy: BufferedTransportProxy
};

export class FramedTransportConnection implements TransportConnection, TransportFrameListener {

    private log: Logger;

    private connectionCancellationToken: ReadWriteCancellationToken = new ReadWriteCancellationToken();

    private channelObserver: BufferedObserver<TransportChannel>;

    private channelsHolder: Map<string, ChannelDescriptor> = new Map();

    private framesHandler: TransportFrameHandler = new TransportFrameHandler();

    private readonly stateMachine: StateMaschine<ConnectionState>;

    constructor(private framedTransport: ConnectableFramedTransport) {
        this.log = LoggerFactory.getLogger(`FramedTransportConnection [${this.uuid().toString()}]`);
        this.channelObserver = new BufferedObserver(1024, this.log);
        this.stateMachine = this.createStateMaschine();
        this.log.debug('Created');
    }

    public async disconnect(completion?: plexus.ICompletion): Promise<void> {
        switch (this.stateMachine.getCurrent()) {
            case ConnectionState.OPEN:
                this.log.debug('Current state is OPEN, requesting connection close');
                await this.stateMachine.goAsync(ConnectionState.CLOSE_REQUESTED, {
                    preHandler: async () => {
                        await this.sendConnectionCloseMessage(completion);
                    }
                });
                break;
            case ConnectionState.CLOSE_RECEIVED:
                this.log.debug('Current state is CLOSE_RECEIVED, closing all');
                await this.sendConnectionCloseMessage(completion);
                this.closeAndCleanUp();
                break;
            default:
                throw new Error(`Can't close, invalid state ${this.stateMachine.getCurrent()}`);
        }
    }

    public getManagedChannels(): TransportChannel[] {
        const result: TransportChannel[] = [];
        this.channelsHolder.forEach(value => {
            result.push(value.channel);
        });
        return result;
    }

    public getManagedChannel(id: string): TransportChannel | undefined {
        const descriptor = this.channelsHolder.get(id);
        return descriptor ? descriptor.channel : undefined;
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

    public isConnected(): boolean {
        return !this.stateMachine.isOneOf(ConnectionState.CREATED, ConnectionState.CLOSED);
    }

    public subscribeToChannels(channelObserver: Observer<TransportChannel>): Subscription {
        this.log.debug('Received channels observer');        
        this.channelObserver.setObserver(channelObserver);
        return new AnonymousSubscription();
    }

    public async connect(channelObserver?: Observer<TransportChannel>): Promise<void> {
        this.log.debug(`Opening connection, channel observer ${!!channelObserver ? 'provided' : 'not provided'}`);
        if (channelObserver) {
            this.channelObserver.setObserver(channelObserver);
        }
        return this.stateMachine.goAsync(ConnectionState.OPEN);
    }

    public async acceptingConnection(channelObserver?: Observer<TransportChannel>): Promise<void> {
        this.log.debug(`Accepting connection, channel observer ${!!channelObserver ? 'provided' : 'not provided'}`);
        if (channelObserver) {
            this.channelObserver.setObserver(channelObserver);
        }
        return this.stateMachine.goAsync(ConnectionState.ACCEPT);
    }
    
    public closeAndCleanUp(): void {
        if (this.stateMachine.is(ConnectionState.CLOSED)) {
            this.log.debug('Already closed');
            return;
        }
        /* istanbul ignore if */
        if (this.log.isDebugEnabled()) {
            this.log.debug(`Closing connection, current state is ${this.stateMachine.getCurrent()}`);
        }
        this.connectionCancellationToken.cancel('Connection is closed');
        this.stateMachine.go(ConnectionState.CLOSED);
        this.channelsHolder.forEach((value, key: string) => {
            this.log.debug(`Cleaning channel ${key}`);
            value.channel.closeInternal('Transport connection closed');
            value.channelTransportProxy.clear();
        });
        this.channelsHolder.clear();
        this.disconnectFromSource()
            .catch(e => this.log.error('Failed to disconnect from source', e));
    }

    
    public async handleConnectionCloseFrame(frame: ConnectionCloseFrame): Promise<void> {
        const completion = frame.getHeaderData().completion as plexus.ICompletion || new SuccessCompletion();
        /* istanbul ignore if */
        if (this.log.isDebugEnabled()) {
            this.log.debug('Received connection close', JSON.stringify(completion));
        }
        if (!ClientProtocolUtils.isSuccessCompletion(completion)) {
            this.log.error('Received connection close with error', JSON.stringify(completion));
            this.reportErrorToChannels(completion.error || new ClientError('Transport closed with error'));
            this.closeAndCleanUp();
        } else {
            switch (this.stateMachine.getCurrent()) {
                case ConnectionState.OPEN:
                    this.log.debug('Close received, waiting for client to close it');
                    this.stateMachine.go(ConnectionState.CLOSE_RECEIVED);
                    this.channelObserver.complete();                    
                    break;
                case ConnectionState.CLOSE_REQUESTED:
                    this.log.debug('Close already requested, closing connection');
                    this.channelObserver.complete();                    
                    this.closeAndCleanUp();
                    break;
                default:
                    throw new Error(`Can't handle close, invalid state ${this.stateMachine.getCurrent()}`);
            }
        }
    }

    public handleChannelOpenFrame(frame: ChannelOpenFrame): void {
        this.log.trace('Received channel open frame');
        const channelId = UniqueId.fromProperties(frame.getHeaderData().channelId as plexus.IUniqueId);
        this.log.debug(`Received open channel request ${channelId}`);
        if (!this.channelsHolder.has(channelId.toString())) {
            this.createInChannel(channelId);
        } else {
            this.log.debug(`Channel ${channelId.toString()} already exist`);
        }
    }

    public handleChannelCloseFrame(frame: ChannelCloseFrame): void {
        const channelId = UniqueId.fromProperties(frame.getHeaderData().channelId as plexus.IUniqueId);
        const strChannelId = channelId.toString();
        /* istanbul ignore if */
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Received channel close frame, channelId ${strChannelId}`);
        }
        if (this.channelsHolder.has(strChannelId)) {
            const channelDescriptor = this.channelsHolder.get(strChannelId) as ChannelDescriptor;
            this.log.debug('Pass close frame to channel', strChannelId);
            channelDescriptor.channelTransportProxy.next(frame);
            channelDescriptor.channelTransportProxy.complete();
        } else {
            this.log.warn(`Received close channel frame for not existing uuid ${strChannelId}`);
        }
    }

    public handleConnectionOpenFrame(frame: ConnectionOpenFrame): void {
        this.log.trace('Received connection open frame');
        if (this.stateMachine.is(ConnectionState.OPEN)) {
            this.log.debug(`Received connection open confimation`);
        } else if (this.stateMachine.is(ConnectionState.ACCEPT)) {
            this.log.debug(`Received connection open request`);
            this.stateMachine.go(ConnectionState.OPEN);
        }
    }

    public handleMessageFrame(frame: MessageFrame): void {
        const channelIdProps = frame.getHeaderData().channelId as plexus.IUniqueId;
        const channelId = UniqueId.fromProperties(channelIdProps);
        const strChannelId = channelId.toString();
        /* istanbul ignore if */
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Received message frame, channelId ${strChannelId}`);
        }
        const channelExists = this.channelsHolder.has(strChannelId);
        if (!channelExists) {
            // not first frame, however no buffer exist
            this.log.error(`Dropped frame, no incoming buffer exist for ${strChannelId}`);
        } else {
            // add frame to incoming buffer
            /* istanbul ignore if */
            if (this.log.isDebugEnabled()) {
                this.log.debug(`Received data frame for channel ${strChannelId}`);
            }
            const channelDescriptor = this.channelsHolder.get(strChannelId) as ChannelDescriptor;
            channelDescriptor.channelTransportProxy.next(frame);
        }
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
                    this.connectionCancellationToken.cancelRead('Connection close received');
                }
            },
            // graceful connection closure
            {
                from: ConnectionState.CLOSE_REQUESTED, to: ConnectionState.CLOSED
            }
        ], this.log);
    }

    private async sendConnectionCloseMessage(completion?: plexus.ICompletion): Promise<void> {
        this.log.debug('Requesting close connection');
        this.framedTransport.writeFrame(ConnectionCloseFrame.fromHeaderData({ completion }));
    }

    private async openConnectionInternal(): Promise<void> {
        this.log.trace('Opening connection');
        const id = this.framedTransport.uuid();
        this.framedTransport.writeFrame(
            ConnectionOpenFrame.fromHeaderData({
                connectionId: id
            }));
    }

    private async disconnectFromSource(): Promise<void> {
        this.log.debug('Disconnecting from source transport');
        return this.framedTransport
            .disconnect()
            .then(() => {
                this.log.debug('Transport disconnected');
            }, (error) => {
                this.log.error('Transport disconnect error', error);
            });
    }

    private async listenForIncomingFrames(): Promise<void> {
        this.log.debug('Start listening of incoming frames');
        this.framedTransport.open({
            next: (frame) => {
                if (this.stateMachine.isOneOf(
                    ConnectionState.CLOSE_REQUESTED,
                    ConnectionState.OPEN,
                    ConnectionState.ACCEPT)) {
                    this.framesHandler.handleFrame(frame, this.log, this);
                } else {
                    this.log.warn('Not connected, dropping frame');
                }
            },
            error: (transportError) => {
                this.log.error('Error from source transport', transportError);
                this.reportErrorToChannels(transportError);
                this.closeAndCleanUp();
            },
            complete: () => {
                this.log.debug('Source connection completed');
                this.closeAndCleanUp();
            }
        });
    }

    private reportErrorToChannels(error: any): void {
        this.channelsHolder.forEach((value, key: string) => {
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
        const channelTransportProxy = new BufferedTransportProxy(this.framedTransport, this.connectionCancellationToken.getWriteToken(), proxyLogger);
        const dispose = async () => {
            /* istanbul ignore if */
            if (this.log.isDebugEnabled()) {
                this.log.debug(`Dispose called on ${strChannelId} channel`);
            }
            if (this.channelsHolder.has(strChannelId)) {
                const channelDescriptor = this.channelsHolder.get(strChannelId) as ChannelDescriptor;
                channelDescriptor.channelTransportProxy.clear();
                this.channelsHolder.delete(strChannelId);
            }
        };
        const channel = new FramedTransportChannel(channelId, channelTransportProxy, dispose, this.connectionCancellationToken.getWriteToken());
        this.channelsHolder.set(strChannelId, { channel, channelTransportProxy });
        if (isIncomingChannel) {
            (this.channelObserver as Observer<TransportChannel>).next(channel);
        }
        return { channel, channelTransportProxy };
    }

}