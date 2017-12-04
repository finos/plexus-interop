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
import { EventBus } from "../EventBus";
import { Event } from "../Event";
import "jStorage";
import { Subscription, Logger, LoggerFactory, AnonymousSubscription } from "@plexus-interop/common";

const globalObj: any = global || window;

export class JStorageEventBus implements EventBus {

    private readonly log: Logger;

    private jStorage: JStorageStatic = globalObj.$.jStorage;

    public constructor(readonly namespace: string = "plexus-bus") {
        this.log = LoggerFactory.getLogger(`JStorageEventBus [${namespace}]`);
    }

    public publish(key: string, event: Event): void {
        const topic = this.internalKey(key);
        this.log.info(`Publishing event to ${topic}`);
        this.jStorage.publish(topic, event.payload);
    }

    public subscribe(key: string, handler: (event: Event) => void): Subscription {
        const topic = this.internalKey(key);
        // TODO handle unsubscribe
        this.jStorage.subscribe(this.internalKey(key), (channel: string, value: any) => {
            this.log.trace(`Received update for ${topic}`);
            handler({ payload: value });
        });
        return new AnonymousSubscription();
    }

    private internalKey(key: string): string {
        return `${this.namespace}:${key}`;
    }
}