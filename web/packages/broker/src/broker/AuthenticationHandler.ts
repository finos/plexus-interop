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
import { TransportChannel, TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { ClientProtocolHelper, clientProtocol as plexus, ErrorCompletion, ClientError } from "@plexus-interop/protocol";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { ApplicationDescriptor } from "../lifecycle/ApplicationDescriptor";
import { AppRegistryService } from "../metadata/apps/AppRegistryService";

/**
 * Responsible for handling of first channel with Authentication Details
 */
export class AuthenticationHandler implements AsyncHandler<[TransportConnection, TransportChannel], ApplicationDescriptor> {

    constructor(private readonly appService: AppRegistryService) { }

    public handle(connectionDetails: [TransportConnection, TransportChannel]): Promise<ApplicationDescriptor> {

        const [connection, channel] = connectionDetails;
        const channelId = channel.uuid().toString();

        const log: Logger = LoggerFactory.getLogger(`AuthenticationHandler [${channelId}]`);

        return new Promise((resolve, reject) => {

            channel.open({

                started: () => { },

                startFailed: (e) => reject(e),

                next: async message => {

                    if (log.isDebugEnabled()) {
                        log.debug(`Connect message received`);
                    }

                    const clientToBrokerMessage = ClientProtocolHelper.decodeConnectRequest(message);

                    const appId = clientToBrokerMessage.applicationId as string;

                    if (log.isDebugEnabled()) {
                        log.debug(`Connect request from [${appId}] application received`);
                    }

                    if (!this.appService.isAppExist(appId)) {
                        const errorMsg = `App [${appId}] doesn't exist`;
                        log.warn(errorMsg);
                        channel.close(new ErrorCompletion(new ClientError(errorMsg)));
                        reject(new Error(errorMsg));
                    } else {
                        channel.sendLastMessage(ClientProtocolHelper.connectResponsePayload({ connectionId: connection.uuid() }))
                            .catch(e => log.error("Failed to sent connection details", e));
                        resolve({
                            applicationId: clientToBrokerMessage.applicationId as string,
                            instanceId: UniqueId.fromProperties(clientToBrokerMessage.applicationInstanceId as plexus.IUniqueId)
                        });
                    }
                    
                },

                error: e => {
                    log.error("Error from source channel received", e);
                    reject(e)
                },

                complete: () => {
                    log.debug(`Channel closed`);
                }

            });
        });
    }

}