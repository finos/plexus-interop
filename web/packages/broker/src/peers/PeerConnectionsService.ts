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
import { AppConnectionHeartBit } from './events/AppConnectionHeartBit';
import { Subscription, Logger, LoggerFactory } from '@plexus-interop/common';
import { PartialObserver } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { EventType } from './events/EventType';
import 'rxjs/add/operator/share';
import { RemoteBrokerService } from './remote/RemoteBrokerService';

export class PeerConnectionsService {

    private readonly log: Logger = LoggerFactory.getLogger('PeerConnectionService');

    private $heartbits: Observable<AppConnectionHeartBit>;

    constructor(private remoteBrokerService: RemoteBrokerService) {
        this.init();
    }

    public subscribeToConnectionsHearBits(observer: PartialObserver<AppConnectionHeartBit>): Subscription {
        return this.$heartbits.subscribe(observer);
    }

    public sendHeartBit(heartBit: AppConnectionHeartBit): void {
        this.remoteBrokerService.publish<AppConnectionHeartBit>(EventType.AppConnectionHearBit, heartBit);
    }

    private init(): void {
        this.$heartbits = new Observable<AppConnectionHeartBit>(observer => {
            this.log.debug('Subscribing to app heartbits');
            const sourceSubscription = this.remoteBrokerService.subscribe(EventType.AppConnectionHearBit, observer);
            return () => {
                this.log.debug('Unsubscribing from app hearbits');
                sourceSubscription.unsubscribe();
            };
        })
            // important, make observable shared between multiple subscriptions
            .share();
    }

}