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
import { EventBus } from '../EventBus';
import { Event } from '../Event';
import { Subscription, AnonymousSubscription, Logger, LoggerFactory, InMemoryCache, CacheEntry } from '@plexus-interop/common';

/**
 * Event bus based on Broad Cast Channel API 
 * https://html.spec.whatwg.org/multipage/web-messaging.html#broadcasting-to-other-browsing-contexts
 */
export class BroadCastChannelEventBus implements EventBus {

    private readonly openChannelTtl: number = 300000;

    private readonly log: Logger;

    // tslint:disable-next-line:typedef
    private readonly openChannels = new InMemoryCache();

    public constructor(private readonly namespace: string = 'plexus-bus') {
        this.log = LoggerFactory.getLogger(`BroadCastEventBus [${namespace}]`);
    }

    public subscribe(key: string, handler: (event: Event) => void): Subscription {
        this.log.trace(`Subscribing to ${key}`);
        const channel = new BroadcastChannel(this.internalKey(key));
        channel.onmessage = e => {
            handler({ payload: e.data });
        };
        return new AnonymousSubscription(() => {
            this.log.trace(`Closing subscription to channel ${key}`);
            channel.close();
        });
    }

    public publish(key: string, event: Event): void {
        this.log.trace(`Publishing to ${key}`);
        const channel = this.lookupOpenChannel(key);
        channel.postMessage(event.payload);
    }

    public async init(): Promise<EventBus> {
        if (typeof BroadcastChannel === 'undefined') {
            throw new Error('Browser doesn\'t support BroadCastChannel API');
        } else {
            return this;
        }
    }

    private lookupOpenChannel(key: string): BroadcastChannel {
        let channel = this.openChannels.get<BroadcastChannel>(key);
        if (!channel) {
            channel = new BroadcastChannel(this.internalKey(key));
            this.openChannels.set<BroadcastChannel>(key, new CacheEntry<BroadcastChannel>(channel, this.openChannelTtl, () => {
                this.log.debug(`TTL passed for ${key} channel, closing it`);
                (channel as BroadcastChannel).close();
            }));
        } else {
            this.openChannels.resetTtl(key);
        }
        return channel;
    }

    private internalKey(key: string): string {
        return `${this.namespace}:${key}`;
    }

}