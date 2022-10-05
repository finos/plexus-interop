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
import { TransportConnection } from '@plexus-interop/transport-common';
import { GenericClient } from './GenericClient';
import { Logger, LoggerFactory } from '@plexus-interop/common';
import { GenericClientImpl } from './GenericClientImpl';
import { SingleMessageRequest } from './SingleMessageRequst';
import { ClientConnectRequest } from '@plexus-interop/client-api';
import { clientProtocol as plexus, ClientProtocolHelper, UniqueId } from '@plexus-interop/protocol';

export class GenericClientFactory {

    private log: Logger = LoggerFactory.getLogger('GenericClientFactory');

    constructor(
        private readonly transportConnection: TransportConnection,
        private readonly onDisconnect?: () => Promise<void>) { }

    public async createClient(request: ClientConnectRequest): Promise<GenericClient> {
        const requestPayload = ClientProtocolHelper.connectRequestPayload(request);
        this.log.debug('Sending client connect request');
        return new SingleMessageRequest<plexus.interop.protocol.IConnectResponse>(this.transportConnection, this.log)
            .execute(requestPayload, (responsePayload) => ClientProtocolHelper.decodeConnectResponse(responsePayload))
            .then(response => {
                this.log.info('Client connected');
                return new GenericClientImpl(
                    request,
                    UniqueId.fromProperties(response.connectionId as plexus.IUniqueId),
                    this.transportConnection,
                    this.onDisconnect);
            });
    }
}