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
import { Logger } from "@plexus-interop/common";
import { ClientProtocolHelper } from "./ClientProtocolHelper";

/**
 * Represents Single Request to Broker
 */
export class SingleMessageRequest<R> {

    constructor(
        private readonly transportConnection: TransportConnection,
        private readonly log: Logger) { }

    public async execute(requestPayload: ArrayBuffer, decodeFn: (responsePayload: ArrayBuffer) => R): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            (async () => {
                try {
                    const channel = await this.transportConnection.createChannel();
                    channel.open({
                        startFailed: (e) => reject(e),
                        started: () => {
                            this.log.debug("Channel is open, sending connection request");
                            channel.sendLastMessage(requestPayload)
                                .then(completion => {
                                    if (!ClientProtocolHelper.isSuccessCompletion(completion)) {
                                        if (this.log.isDebugEnabled()) {
                                            this.log.debug("Received non successful completion", completion);
                                            reject(completion.error);
                                        }
                                    }  
                                });
                        },
                        next: (data) => {
                            try {
                                this.log.trace("Received single message response");
                                const message = decodeFn(data);
                                resolve(message);
                            } catch (decodingError) {
                                this.log.error("Unable to decode message", decodingError);
                                reject(decodingError);
                            }
                        },
                        complete: () => this.log.debug("Channel closed"),
                        error: (e) => reject(e)
                    });
                } catch (error) {
                    this.log.error("Unable to open channel", error);
                    reject(error);
                }
            })();
        });
    }
}
