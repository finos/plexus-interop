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
import { EventBus } from './EventBus';
import { Event } from './Event';
import { Subscription, Logger, LoggerFactory } from '@plexus-interop/common';

export class FallbackEventBus implements EventBus {

    private readonly log: Logger = LoggerFactory.getLogger('FallbackEventBus');

    private baseEventBus: EventBus;

    public constructor(private readonly sources: EventBus[]) { }

    public async init(): Promise<EventBus> {
        if (!this.sources || this.sources.length === 0) {
            throw new Error('No source provided');
        }
        for (let i = 0; i < this.sources.length; i++) {
            try {
                this.baseEventBus = await this.sources[i].init();
                break;
            } catch (error) {
                this.log.warn('Unable to init Event Bus', error);
            }
        }
        if (this.baseEventBus) {
            return this.baseEventBus;
        } else {
            throw new Error('All source Event Bus providers failed');
        }
    }

    public publish(key: string, event: Event): void {
        if (this.baseEventBus) {
            this.baseEventBus.publish(key, event);
        } else {
            throw new Error('Not initialyzed');
        }
    }

    public subscribe(key: string, handler: (event: Event) => void): Subscription {
        if (this.baseEventBus) {
            return this.baseEventBus.subscribe(key, handler);
        } else {
            throw new Error('Not initialyzed');
        }
    }
}