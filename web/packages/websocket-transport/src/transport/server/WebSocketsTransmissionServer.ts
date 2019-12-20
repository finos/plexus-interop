/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
import { Observer, LoggerFactory } from '@plexus-interop/common';
import WebSocket, { AddressInfo } from 'ws';
import { WebSocketConnectionFactory } from '../WebSocketConnectionFactory';

const logger = LoggerFactory.getLogger('WebSocketsTransmissionServer');

export class WebSocketsTransmissionServer implements TransmissionServer {

    constructor(private readonly _port: number) {}

    async start(
        connectionsObserver: Observer<TransportConnection>): Promise<ServerStartupDescriptor> {

        logger.info(`Trying to start server on ${this._port}`);

        const wss = new WebSocket.Server({ port: this._port });

        return new Promise((resolve, reject) => {

            wss.on('listening', () => {
                logger.info(`Started ${addressToString(wss.address())}`);
            });

            wss.on('connection', this._createConnectionHandler(connectionsObserver));

            wss.on('error', e => {
                logger.error('Server failure', e);
                connectionsObserver.error(e);
                reject(e);
            });

            const instance = {
                stop: this._createStopHandler(wss)
            };

            const serverDescriptor: ServerStartupDescriptor = {
                connectionsSubscription: {
                    unsubscribe: () => {
                        logger.info('Connections subscription stopped');
                        instance.stop()
                            .catch(e => logger.warn('Failure on stopping the server'));
                    }
                },
                instance
            };

            resolve(serverDescriptor);

        });
    }

    private _createConnectionHandler(connectionsObserver: Observer<TransportConnection>) {
        return (socket: WebSocket) => {
            logger.debug('Accepted new ws connection');
            new WebSocketConnectionFactory(socket).connect()
                .then(transportConnection => connectionsObserver.next(transportConnection))
                .catch(e => logger.error('Error during Web Socket Transport connection initialization', e));
        };
    }

    private _createStopHandler(wss: WebSocket.Server): () => Promise<void> {
        return () => {
            return new Promise((resolve, reject) => {
                logger.info('Stop requested');
                wss.close(e => {
                    logger.info('Underlying server stopped', e);
                    if (e) {
                        reject(e);
                    } else {
                        resolve();
                    }
                });
            });
        };
    }

}

function addressToString(addressOrString: AddressInfo | string): string {
    if ((addressOrString as AddressInfo).address) {
        const { address, family, port } = addressOrString as AddressInfo;
        return `${family}/${address}:${port}`;
    } else {
        return addressOrString as string;
    }
}