/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import 'ya-js-storage';
import { Subscription, Logger, LoggerFactory, AnonymousSubscription } from '@plexus-interop/common';

const globalObj: any = global || window;
const yaJsStorage = globalObj.$.yaJsStorage;

export class JStorageEventBus implements EventBus {

    private readonly log: Logger;

    private yaStorage: JStorageStatic = yaJsStorage;

    public constructor(readonly namespace: string = 'plexus-bus') {
        this.log = LoggerFactory.getLogger(`JStorageEventBus [${namespace}]`);
    }

    public async init(): Promise<EventBus> {
        return this;
    }

    public publish(key: string, event: Event): void {
        const topic = this.internalKey(key);
        this.log.trace(`Publishing event to ${topic}`);
        this.yaStorage.publish(topic, event.payload);
    }

    public subscribe(key: string, handler: (event: Event) => void): Subscription {
        const topic = this.internalKey(key);
        this.log.trace(`Subscribing to ${topic}`);        
        const unsubscribe: any = this.yaStorage.subscribe(this.internalKey(key), (channel: string, value: any) => {
            this.log.trace(`Received update for ${topic}`);
            handler({ payload: value });
        });
        return new AnonymousSubscription(() => {
            this.log.trace(`Unsubscribing from internal ${key} channel`);
            unsubscribe();
        });
    }

    private internalKey(key: string): string {
        return `${this.namespace}:${key}`;
    }
}