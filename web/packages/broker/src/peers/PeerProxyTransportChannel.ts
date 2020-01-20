/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { TransportChannel, ChannelObserver } from '@plexus-interop/transport-common';
import { clientProtocol as plexus, UniqueId, SuccessCompletion, ErrorCompletion, ClientError } from '@plexus-interop/protocol';
import { AnonymousSubscription, Logger, LoggerFactory, arrayBufferToString, stringToArrayBuffer } from '@plexus-interop/common';
import { RemoteActions } from './actions/RemoteActions';
import { RemoteBrokerService } from './remote/RemoteBrokerService';

export class PeerProxyTransportChannel implements TransportChannel {

    private readonly log: Logger;

    private readonly channelId: UniqueId;

    public constructor(
        private strChannelId: string,
        private remoteConnectionId: string,
        private remoteBrokerService: RemoteBrokerService) {
        this.channelId = UniqueId.fromString(strChannelId);
        this.log = LoggerFactory.getLogger(`PeerProxyTransportChannel [${strChannelId}]`);
        this.log.debug('Created');
    }

    public uuid(): UniqueId {
        return this.channelId;
    }

    public async sendMessage(data: ArrayBuffer): Promise<void> {
        this.log.trace(`Sending message of ${data.byteLength} bytes`);
        await this.remoteBrokerService.invokeUnary(RemoteActions.SEND_MESSAGE, {
            channelId: this.strChannelId,
            messagePayload: arrayBufferToString(data)
        }, this.remoteConnectionId);
    }

    public sendLastMessage(data: ArrayBuffer): Promise<plexus.ICompletion> {
        this.sendMessage(data);
        return this.close();
    }

    public open(observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>): void {
        this.log.trace('Received open channel request');
        this.remoteBrokerService.invoke(RemoteActions.OPEN_CHANNEL, {
            channelId: this.strChannelId
        }, this.remoteConnectionId, {
                next: payload => {
                    const abPayload = stringToArrayBuffer(payload);
                    this.log.trace(`Received payload from remote, ${abPayload.byteLength} bytes`);
                    observer.next(abPayload);
                },
                error: e => {
                    this.log.error('Received remote error', e);
                    observer.error(e);
                },
                complete: completion => {
                    this.log.trace('Received remote completion');
                    observer.complete(completion);
                }
            });
    }

    public async close(completion: plexus.ICompletion = new SuccessCompletion()): Promise<plexus.ICompletion> {
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Sending channel close ${JSON.stringify(completion)} bytes`);
        }
        try {
            const response = await this.remoteBrokerService.invokeUnary(RemoteActions.CLOSE_CHANNEL, {
                channelId: this.strChannelId,
                completion
            }, this.remoteConnectionId);
            return response.completion;
        } catch (error) {
            this.log.error('Error on close received', error);
            return new ErrorCompletion(new ClientError(error));
        }
    }

}