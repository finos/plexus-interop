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
import { AppConnectionHeartBit } from "./events/AppConnectionHeartBit";
import { Observer, Subscription, Logger, LoggerFactory } from "@plexus-interop/common";
import { PartialObserver } from "rxjs/Observer";
import { PeerTransport } from "./PeerTransport";
import { Observable } from "rxjs/Observable";
import { EventType } from "./events/EventType";
import "rxjs/add/operator/share";

export class PeerConnectionsService {

    private readonly log: Logger = LoggerFactory.getLogger("PeerConnectionService");

    constructor(private peerTransport: PeerTransport) {}

    private $heartbits: Observable<AppConnectionHeartBit>;

    private createInternalObservables() {
        this.$heartbits = new Observable(observer => {
            this.log.debug("Subscribing to app hearbits");
            const sourceSubscription = this.peerTransport.subscribe(EventType.AppConnectionHearBit, (heartBit: AppConnectionHeartBit) => {
                observer.next(heartBit);
            });
            return () => {
                this.log.debug("Unsubscribing from app hearbits");
                sourceSubscription.unsubscribe();
            }
        })
        // important, make observable shared between multiple subscriptions
        .share();
    }

    public subscribeToConnectionsHearBits(observer: PartialObserver<AppConnectionHeartBit>): Subscription {
        return this.$heartbits.subscribe(observer);
    }

}