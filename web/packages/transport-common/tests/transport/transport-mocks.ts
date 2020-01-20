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
import { TestInMemoryConnectionFactory } from './TestInMemoryConnectionFactory';
import { TransportConnection } from '../../src/transport/TransportConnection';
import { TransportChannel } from '../../src/transport/TransportChannel';
import { BufferedObserver } from '../BufferedObserver';

export async function setupConnections(): Promise<{ client: TransportConnection, server: TransportConnection, clientChannelsObserver: BufferedObserver<TransportChannel>, serverChannelsObserver: BufferedObserver<TransportChannel> }> {
    
    const factory = new TestInMemoryConnectionFactory();
    const clientChannelsObserver = new BufferedObserver<TransportChannel>();
    const serverChannelsObserver = new BufferedObserver<TransportChannel>();
    
    return Promise.all([
            factory.connectClient(clientChannelsObserver), 
            factory.connectServer(serverChannelsObserver)])
        .then((data) => {
            return { client: data[0], server: data[1], clientChannelsObserver, serverChannelsObserver };
        });

}

export function disconnect(clientConnection: TransportConnection, serverConnection: TransportConnection): Promise<any> {
    return Promise.all([clientConnection.disconnect(), serverConnection.disconnect()]);
}
