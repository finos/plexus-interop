/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
import { TransportChannel, ChannelObserver } from '@plexus-interop/transport-common';
import { clientProtocol as plexus, UniqueId, ClientProtocolHelper, SuccessCompletion } from '@plexus-interop/protocol';
import { AnonymousSubscription, Logger, LoggerFactory } from '@plexus-interop/common';
import { ApplicationConnectionDescriptor } from '../lifecycle/ApplicationConnectionDescriptor';

/**
 * Providing connectivity details about proxy connection to locally running Broker
 */
export class ProxyAuthenticationHandler implements TransportChannel {

    private readonly log: Logger;

    constructor(
        private readonly connectionDescriptor: ApplicationConnectionDescriptor,
        private readonly id: UniqueId = UniqueId.generateNew()) {
        this.log = LoggerFactory.getLogger(`ProxyAuthenticationHandler [${this.id.toString()}]`);
    }

    public sendLastMessage(data: ArrayBuffer): Promise<plexus.ICompletion> {
        this.sendMessage(data);
        return this.close(new SuccessCompletion());
    }

    public async close(completion?: plexus.ICompletion): Promise<plexus.ICompletion> {
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Received completion from broker, ${JSON.stringify(completion)}`);
        }
        return new SuccessCompletion();
    }

    public open(observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>): void {
        this.log.trace(`Received subscribe, sending connect payload`);
        observer.started(new AnonymousSubscription());
        observer.next(ClientProtocolHelper.connectRequestPayload({
            applicationId: this.connectionDescriptor.applicationId,
            applicationInstanceId: UniqueId.fromString(this.connectionDescriptor.instanceId)
        }));
        observer.complete();
    }

    public async sendMessage(data: ArrayBuffer): Promise<void> {
        this.log.debug(`Received message of ${data.byteLength} bytes`);
    }

    public uuid(): UniqueId {
        return this.id;
    }

}