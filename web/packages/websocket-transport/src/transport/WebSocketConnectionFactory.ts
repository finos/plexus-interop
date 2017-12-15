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
import { ClientConnectionFactory, TransportConnection, FramedTransportConnection, ConnectionDetails } from "@plexus-interop/transport-common";
import { WebSocketFramedTransport } from "./WebSocketFramedTransport";

export class WebSocketConnectionFactory implements ClientConnectionFactory {

    constructor(private readonly socket: WebSocket) { }

    public connect(connectionDetails?: ConnectionDetails): Promise<TransportConnection> {
        return new Promise((resolve, reject) => {
            const webSocketTransport = new WebSocketFramedTransport(this.socket);
            webSocketTransport.connectionEstablished().then(() => {
                const connection = new FramedTransportConnection(webSocketTransport);
                connection.connect(connectionDetails ? connectionDetails.incomingChannelsObserver : undefined)
                    .then(() => resolve(connection))
                    .catch(reject);
            }, (error) => {
                reject(error);
            });
        });
    }

}