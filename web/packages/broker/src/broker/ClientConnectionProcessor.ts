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
import { AsyncHandler } from "../AsyncHandler";
import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { Completion, ErrorCompletion, SuccessCompletion, UniqueId } from "@plexus-interop/protocol";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { transportProtocol as plexus } from "@plexus-interop/protocol";
import { ApplicationDescriptor } from "../lifecycle/ApplicationDescriptor";
import { ClientRequestProcessor } from "./ClientRequestProcessor";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";

export class ClientConnectionProcessor implements AsyncHandler<TransportConnection, Completion> {

    constructor(
        private readonly authenticationProcessor: AsyncHandler<[TransportConnection, TransportChannel], ApplicationDescriptor>,
        private readonly clientRequestProcessor: ClientRequestProcessor,
        private readonly appLifeCycleManager: AppLifeCycleManager) { }

    public async handle(connection: TransportConnection): Promise<Completion> {

        const log: Logger = LoggerFactory.getLogger(`ConnectionProcessor [${connection.uuid().toString()}]`);
        log.debug(`Received connection`);

        return new Promise((resolve, reject) => {
            let sourceConnection: undefined | ApplicationConnection;
            connection.open({
                next: async channel => {
                    const channelStrId = channel.uuid().toString();
                    log.debug(`Received new channel [${channelStrId}]`);
                    if (!sourceConnection) {
                        try {
                            log.debug("First channel, trying to setup connection");
                            const appDescriptor = await this.authenticationProcessor.handle([connection, channel]);
                            const appConnection = await this.appLifeCycleManager.acceptConnection(connection, {
                                applicationId: appDescriptor.applicationId as string,
                                instanceId: UniqueId.fromProperties(appDescriptor.instanceId as plexus.IUniqueId)
                            }, (connection) => {
                                // TODO handle connection drop
                                log.error("Connection dropped");
                            });
                            sourceConnection = appConnection;
                            log.trace("Connected to client");
                        } catch (error) {
                            log.error("Unable to authenticate client connection");
                            reject(error);
                        }
                    } else {
                        log.trace(`Processing client request channel  [${channelStrId}]`);
                        try {
                            const channelCompletion = await this.clientRequestProcessor.handle(channel, sourceConnection);
                            if (log.isTraceEnabled()) {
                                log.trace(`Received channel completion [${JSON.stringify(channelCompletion)}]`);
                            }
                        } catch (error) {
                            log.trace(`Failed on processing of [${channelStrId}] client request`);
                        }
                    }
                },
                complete: () => {
                    // TODO clean up
                    resolve(new SuccessCompletion());
                },
                error: e => {
                    // TODO clean up
                    reject(new ErrorCompletion(e));
                }
            });
        });
    }

}