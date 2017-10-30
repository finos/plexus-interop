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
import { Completion, ErrorCompletion, SuccessCompletion } from "@plexus-interop/protocol";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";

export class ClientConnectionProcessor implements AsyncHandler<TransportConnection, Completion> {

    constructor(
        private readonly authenticationProcessor: AsyncHandler<TransportChannel, ApplicationConnection>,
        private readonly clientRequestProcessor: AsyncHandler<TransportChannel, Completion>,
        private readonly appLifeCycleManager: AppLifeCycleManager) { }

    public async handle(connection: TransportConnection): Promise<Completion> {

        const log = LoggerFactory.getLogger(`ConnectionProcessor [${connection.uuid().toString()}]`);
        log.debug(`Received connection`);

        let clientConnected = false;
        return new Promise((resolve, reject) => {
            connection.open({
                next: async channel => {
                    const channelStrId = channel.uuid().toString();
                    log.debug(`Received new channel [${channelStrId}]`);
                    if (!clientConnected) {
                        // first channel is connectivity
                        try {
                            log.debug("First channel, trying to setup connection");
                            await this.authenticationProcessor.handle(channel);
                            log.trace("Connected to client");
                            clientConnected = true;
                        } catch (error) {
                            log.error("Unable to authenticate client connection");
                            reject(error);
                        }
                    } else {
                        log.trace(`Processing client request channel  [${channelStrId}]`);
                        try {
                            const channelCompletion = await this.clientRequestProcessor.handle(channel);
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