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
import { TransportConnection, ServerConnectionFactory } from "@plexus-interop/transport-common";
import { Subscription, Observer } from "@plexus-interop/common";
import { HostTransportConnection } from "./HostTransportConnection";
import { RemoteBrokerService } from "../../peers/remote/RemoteBrokerService";

export class HostConnectionFactory implements ServerConnectionFactory {

    public constructor(
        private readonly baseFactory: ServerConnectionFactory,
        private readonly remoteBrokerService: RemoteBrokerService
    ) { }

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        return this.baseFactory.acceptConnections({
            next: c => connectionsObserver.next(new HostTransportConnection(c, this.remoteBrokerService)),
            complete: () => connectionsObserver.complete(),
            error: e => connectionsObserver.error(e)
        });
    }

}