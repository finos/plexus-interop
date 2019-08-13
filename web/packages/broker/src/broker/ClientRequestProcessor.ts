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
import { TransportChannel, BufferedObserver } from '@plexus-interop/transport-common';
import { Completion, ClientProtocolHelper } from '@plexus-interop/protocol';
import { LoggerFactory, Logger } from '@plexus-interop/common';
import { InvocationRequestHandler } from './InvocationRequestHandler';
import { ApplicationConnection } from '../lifecycle/ApplicationConnection';
import { DiscoveryRequestHandler } from './DiscoveryRequestHandler';

export class ClientRequestProcessor {

    private readonly log: Logger = LoggerFactory.getLogger('ClientRequestProcessor');

    constructor(
        private readonly invocationRequestProcessor: InvocationRequestHandler,
        private readonly discoveryRequestHandler: DiscoveryRequestHandler) { }

    public async handle(channel: TransportChannel, sourceConnection: ApplicationConnection): Promise<Completion> {

        const channelStrId = channel.uuid().toString();
        const log = LoggerFactory.getLogger(`Client Request Processor [${channelStrId}]`);

        return new Promise((resolve, reject) => {

            let channelObserver: BufferedObserver<ArrayBuffer> | undefined;

            channel.open({
                started: () => log.trace('Channel started'),
                startFailed: e => {
                    log.error('Start failed', e);
                    reject(e);
                },
                next: async messagePayload => {
                    if (!channelObserver) {
                        const clientToBrokerRequest = ClientProtocolHelper.decodeClientToBrokerRequest(messagePayload);
                        if (clientToBrokerRequest.invocationStartRequest) {
                            channelObserver = new BufferedObserver<ArrayBuffer>();
                            try {
                                const result = await this.invocationRequestProcessor.handleRequest(
                                    channelObserver,
                                    clientToBrokerRequest.invocationStartRequest,
                                    channel,
                                    sourceConnection.descriptor);
                                resolve(result);
                            } catch (error) {
                                reject(error);
                            }
                        } else if (clientToBrokerRequest.methodDiscoveryRequest) {
                            try {
                                await this.discoveryRequestHandler.handleMethodDiscovery(clientToBrokerRequest.methodDiscoveryRequest, channel, sourceConnection);
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        } else {
                            // TODO support service discovery
                            this.log.error('Not supported request received', JSON.stringify(clientToBrokerRequest));
                        }
                    } else {
                        channelObserver.next(messagePayload);
                    }
                },
                error: e => {
                    log.error('Error from source channel received', e);
                    if (channelObserver) {
                        channelObserver.error(e);
                    }
                    reject(e);
                },
                complete: completion => {
                    if (channelObserver) {
                        channelObserver.complete(completion);
                    }
                    log.trace('Channel completed');
                }
            });
        });
    }

}