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
import { TransportConnection, TransmissionServer, ServerStartupDescriptor } from '@plexus-interop/transport-common';
import { Observer } from '@plexus-interop/common';
import { HostTransportConnection } from './HostTransportConnection';
import { RemoteBrokerService } from '../../peers/remote/RemoteBrokerService';

export class HostTransmissionServer implements TransmissionServer {

    public constructor(
        private readonly _baseServer: TransmissionServer,
        private readonly _remoteBrokerService: RemoteBrokerService
    ) { }

    async start(connectionsObserver: Observer<TransportConnection>): Promise<ServerStartupDescriptor> {
        return this._baseServer.start({
            next: c => connectionsObserver.next(new HostTransportConnection(c, this._remoteBrokerService)),
            complete: () => connectionsObserver.complete(),
            error: e => connectionsObserver.error(e)
        });
    }

}