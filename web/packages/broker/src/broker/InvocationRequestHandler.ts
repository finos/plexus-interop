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
import { clientProtocol as plexus, SuccessCompletion, ClientProtocolHelper } from "@plexus-interop/protocol";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { Completion } from "@plexus-interop/client";
import { Observable } from "rxjs/Observable";
import { RegistryService } from "../metadata/RegistryService";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { TransportChannel } from "@plexus-interop/transport-common";
import { LoggerFactory, Logger } from "@plexus-interop/common";
import { ConsumedMethodReference } from "../metadata/model/ConsumedMethodReference";
import { ProvidedMethodReference } from "../metadata/model/ProvidedMethodReference";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";

export class InvocationRequestHandler {

    private readonly log: Logger = LoggerFactory.getLogger("InvocationRequestHandler");

    constructor(
        private readonly registryService: RegistryService,
        private readonly appLifeCycleManager: AppLifeCycleManager) {}

    public async handleRequest(
        $inMessages: Observable<ArrayBuffer>,
        invocationRequest: plexus.interop.protocol.IInvocationStartRequest, 
        sourceChannel: TransportChannel,
        sourceConnectionDescriptor: ApplicationConnectionDescriptor): Promise<Completion> {

        const sourceChannelId = sourceChannel.uuid().toString();
        const sourceConnectionId = sourceConnectionDescriptor.connectionId.toString();

        if (this.log.isDebugEnabled()) {
            this.log.debug(`Handling start invocation request [${sourceChannelId}] from [${sourceConnectionId}]`);
        }

        const targetAppConnection = await this.resolveTargetConnection(
                (invocationRequest.consumedMethod as ConsumedMethodReference) 
                    || invocationRequest.providedMethod, sourceConnectionDescriptor);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(`Target connection [${targetAppConnection.descriptor.connectionId.toString()}] found`);
        }

        const targetChannel = await targetAppConnection.connection.createChannel();
        const targetChannelId = targetChannel.uuid().toString();

        this.log.debug(`Target channel [${targetChannelId}] created`);
        this.log.trace(`Sending InvocationStarting to [${sourceChannelId}]`);

        sourceChannel.sendMessage(ClientProtocolHelper.invocationStartingMessagePayload({}));

        this.log.trace(`Sending InvocationRequested to [${targetChannelId}]`);

        targetChannel.sendMessage(ClientProtocolHelper.invocationStartRequestPayload({
                // serviceId: 

                // /** InvocationStartRequested serviceAlias */
                // serviceAlias?: string;

                // /** InvocationStartRequested methodId */
                // methodId?: string;

                // /** InvocationStartRequested consumerApplicationId */
                // consumerApplicationId?: string;

                // /** InvocationStartRequested consumerConnectionId */
                // consumerConnectionId?: plexus.IUniqueId;
        }));

        return new SuccessCompletion();
    }

    private async resolveTargetConnection(methodReference: ConsumedMethodReference | ProvidedMethodReference, sourceConnection: ApplicationConnectionDescriptor): Promise<ApplicationConnection> {
        if ((methodReference as ProvidedMethodReference).providedService) {
            throw new Error("Provided methods not implemented yet");
        } else {
            const targetMethods = this.registryService.getMatchingProvidedMethods(sourceConnection.applicationId, methodReference);
            const targetAppIds = targetMethods.map(method => method.providedService.application.id);
            const appConnection  = await this.appLifeCycleManager.getOrSpawnConnectionForOneOf(targetAppIds);
            return appConnection;
        }
    }

}