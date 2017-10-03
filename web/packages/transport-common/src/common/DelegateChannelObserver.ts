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
import { ChannelObserver } from "./ChannelObserver";
import { AnonymousSubscription } from "rxjs/Subscription";
import { Observer } from "@plexus-interop/common";


export class DelegateChannelObserver<T> implements ChannelObserver<AnonymousSubscription, T> {

    constructor(private baseObserver: Observer<T>,
                private subscriptionHandler: (subscription: AnonymousSubscription) => void,
                private startFailedHandler: (error: any) => void = () => {}) {}

    public started(subscription: AnonymousSubscription): void {
        this.subscriptionHandler(subscription);
    }

    public next(value: T): void {
        this.baseObserver.next(value);
    }

    public error(err: any): void {
        this.baseObserver.error(err);
    }

    public complete(): void {
        this.baseObserver.complete();
    }

    public startFailed(error: any): void {
        this.startFailedHandler(error);
    }

}