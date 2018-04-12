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
import { ServerConnectionFactory, TransportConnection } from '@plexus-interop/transport-common';
import { Observer, Subscription, AnonymousSubscription } from '@plexus-interop/common';

export class MultiSourcesServerConnectionFactory implements ServerConnectionFactory {

    private readonly sources: ServerConnectionFactory[];

    constructor(...sources: ServerConnectionFactory[]) {
        this.sources = sources;
    }

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        const subscriptions: Subscription[] = [];
        this.sources.forEach(s => subscriptions.push(s.acceptConnections(connectionsObserver)));
        return new AnonymousSubscription(() => {
            subscriptions.forEach(s => s.unsubscribe());
        });
    }
}