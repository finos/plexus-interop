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
import { InvocationMetaInfo } from '@plexus-interop/protocol';
import { UniqueId, TransportChannel, ChannelObserver } from '@plexus-interop/transport-common';
import { RemoteInvocationInfo } from '@plexus-interop/client-api';
import { MarshallerProvider } from '../../src/client/api/io/MarshallerProvider';
import { Marshaller } from '../../src/client/api/io/Marshaller';
import { Observer } from '@plexus-interop/common';
import { Subscription, AnonymousSubscription } from 'rxjs/Subscription';
import { clientProtocol as plexus, SuccessCompletion} from '@plexus-interop/protocol';
import { Logger, LoggerFactory, BlockingQueue, BlockingQueueBase, CancellationToken } from '@plexus-interop/common';

export function createInvocationInfo(): InvocationMetaInfo {
    return {
        methodId: '1',
        serviceId: '2',
        connectionId: UniqueId.generateNew(),
        applicationId: '3',
        serviceAlias: 'serviceAlias'
    };
};

export function createRemoteInvocationInfo(): RemoteInvocationInfo {
    return {
        methodId: 'actionId',
        serviceId: 'serviceId',
        applicationId: 'applicationId',
        connectionId: UniqueId.generateNew()
    };
};

export class MockMarshaller implements Marshaller {

    public encode(messageObj: any): Uint8Array {
        return new Uint8Array([]);
    }

    public decode(messagePayload: Uint8Array): any {
        return {};
    }
}

export class MockMarshallerProvider implements MarshallerProvider {

    public getMarshaller(type: any): Marshaller {
        return new MockMarshaller();
    }

}

export class BufferedChannel implements TransportChannel {

    private log: Logger = LoggerFactory.getLogger('Test Channel');

    public readonly in: BlockingQueue<ArrayBuffer> = new BlockingQueueBase<ArrayBuffer>();
    public readonly out: BlockingQueue<ArrayBuffer> = new BlockingQueueBase<ArrayBuffer>();
    public readonly id: UniqueId = UniqueId.generateNew();

    constructor(private cancellationToken: CancellationToken) {
        this.log.info('Created');
    }

    public open(observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>): void {
        const subscription = new Subscription(() => this.cancellationToken.cancel('unsubscribed'));
        this.listenToMessages(observer);
        observer.started(subscription);
    }

    private async listenToMessages(observer: Observer<ArrayBuffer>): Promise<void> {
        try {
            while (!this.cancellationToken.isCancelled()) {
                const message = await this.in.blockingDequeue(this.cancellationToken);
                console.log(`Got in message from buffer ${message.byteLength} bytes`);
                observer.next(message);
            }
            observer.complete();
        } catch (error) {
            console.error('Error on reading message', error);
            observer.error(error);
        }
    }

    public addToInbox(data: ArrayBuffer): Promise<void> {
        this.log.debug(`Adding ${data.byteLength} bytes to inbox`);
        return this.in.enqueue(data);
    }

    public pullOutMessage(): Promise<ArrayBuffer> {
        return this.out.blockingDequeue(this.cancellationToken);
    }

    public isInboxEmpty(): boolean {
        return this.in.size() === 0;
    }

    public async sendMessage(data: ArrayBuffer): Promise<void> {
        this.log.debug(`Sending ${data.byteLength} bytes`);
        this.out.enqueue(data);
    }

    public async sendLastMessage(data: ArrayBuffer): Promise<plexus.ICompletion> {
        await this.sendMessage(data);
        return this.close();
    }

    public cancel(): void {
        this.cancellationToken.cancel('Closed');
    }

    public async close(): Promise<SuccessCompletion> {
        this.log.info('Close requested');
        return new SuccessCompletion();
    }

    public uuid(): UniqueId {
        return this.id;
    }

}