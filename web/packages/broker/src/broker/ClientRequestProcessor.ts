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
import { TransportChannel } from "@plexus-interop/transport-common";
import { Completion, SuccessCompletion, ClientProtocolHelper } from "@plexus-interop/protocol";
import { LoggerFactory } from "@plexus-interop/common";

export class ClientRequestProcessor implements AsyncHandler<TransportChannel, Completion> {

    public async handle(channel: TransportChannel): Promise<Completion> {
        const channelStrId = channel.uuid().toString();
        const log = LoggerFactory.getLogger(`Client Request Processor [${channelStrId}]`);
        let firstReceived = false;
        return new Promise((resolve, reject) => {
            channel.open({
                started: () => log.trace("Channel started"),
                startFailed: e => {
                    log.error("Start failed", e);
                    reject(e);
                },
                next: messagePayload => {
                    if (!firstReceived) {
                        const clientToBrokerRequest = ClientProtocolHelper.decodeClientToBrokerRequest(messagePayload);
                        // TODO process client request
                    } else {
                        // TODO
                        // forward to corresponding handler
                    }
                },
                error: e => {
                    log.error("Error from source channel received", e);
                    reject(e);
                },
                complete: () => {
                    log.trace("Channel completed");
                    resolve(new SuccessCompletion());
                }
            });
        });
    }

}