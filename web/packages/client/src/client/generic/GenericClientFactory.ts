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
import { TransportConnection } from "@plexus-interop/transport-common";
import { GenericClient } from "./GenericClient";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { ClientProtocolHelper as modelHelper } from "./ClientProtocolHelper";
import { GenericClientImpl } from "./GenericClientImpl";
import { SingleMessageRequest } from "./SingleMessageRequst";
import { ClientConnectRequest } from "../api/dto/ClientConnectRequest";
import { clientProtocol as plexus } from "@plexus-interop/protocol";

export class GenericClientFactory {

    private log: Logger = LoggerFactory.getLogger("GenericClientFactory");

    constructor(private readonly transportConnection: TransportConnection) { }

    public async createClient(request: ClientConnectRequest): Promise<GenericClient> {
        const requestPayload = modelHelper.connectRequestPayload(request);
        this.log.debug("Sending client connect request");
        return new SingleMessageRequest<plexus.interop.protocol.IConnectResponse>(this.transportConnection, this.log)
            .execute(requestPayload, (responsePayload) => modelHelper.decodeConnectResponse(responsePayload)).then(response => {
                this.log.info("Client connected");
                return new GenericClientImpl(this.transportConnection);
            });
    }
}