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
import { clientProtocol as plexus, SuccessCompletion, ClientProtocolHelper, ErrorCompletion } from "@plexus-interop/protocol";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { Completion } from "@plexus-interop/client";
import { Observable } from "rxjs/Observable";
import { RegistryService } from "../metadata/RegistryService";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { TransportChannel, Defaults } from "@plexus-interop/transport-common";
import { LoggerFactory, Logger, BufferedObserver, Observer } from "@plexus-interop/common";
import { ConsumedMethodReference } from "../metadata/model/ConsumedMethodReference";
import { ProvidedMethodReference } from "../metadata/model/ProvidedMethodReference";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";
import { Types } from "../util/Types";

export class InvocationRequestHandler {

    private readonly log: Logger = LoggerFactory.getLogger("InvocationRequestHandler");

    constructor(
        private readonly registryService: RegistryService,
        private readonly appLifeCycleManager: AppLifeCycleManager) { }

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

        const methodReference: ConsumedMethodReference | ProvidedMethodReference = (invocationRequest.consumedMethod as ConsumedMethodReference) || invocationRequest.providedMethod;

        const targetAppConnection = await this.resolveTargetConnection(methodReference, sourceConnectionDescriptor);

        if (this.log.isDebugEnabled()) {
            this.log.debug(`Target connection [${targetAppConnection.descriptor.connectionId.toString()}] found`);
        }

        const targetChannel = await targetAppConnection.connection.createChannel();
        const targetChannelId = targetChannel.uuid().toString();
        this.log.debug(`Target channel [${targetChannelId}] created`);

        const targetChannelObserver = new BufferedObserver(Defaults.DEFAULT_BUFFER_SIZE, this.log);
        await targetChannel.open({
            next: targetChannelObserver.next,
            complete: targetChannelObserver.complete,
            error: targetChannelObserver.error,
            started: () => { },
            startFailed: () => { }
        });
        this.log.debug(`Target channel [${targetChannelId}] opened`);

        this.log.trace(`Sending InvocationStarting to [${sourceChannelId}]`);
        sourceChannel.sendMessage(ClientProtocolHelper.invocationStartingMessagePayload({}));

        this.log.trace(`Sending InvocationRequested to [${targetChannelId}]`);
        targetChannel.sendMessage(ClientProtocolHelper.invocationRequestedPayload(this.createInvocationStartRequested(methodReference, sourceConnectionDescriptor)));

        const targetPropogationCompleted = this.propogateAll($inMessages, targetChannel, sourceChannel);
        const sourcePropogationCompleted = this.propogateAll(targetChannelObserver, sourceChannel, targetChannel);

        try {
            await Promise.all([targetPropogationCompleted, sourcePropogationCompleted]);
        } catch (error) {
            this.log.error(`Communication between channels [${sourceChannelId}] and [${targetChannelId}] failed`, error);
            // TODO clean up/more logs?
            return new ErrorCompletion(error);
        }
        return new SuccessCompletion();
    }

    private async propogateAll(source: Observable<ArrayBuffer> | BufferedObserver<ArrayBuffer>, targetChannel: TransportChannel, sourceChannel: TransportChannel): Promise<void> {
        const targetChannelId = targetChannel.uuid().toString();
        const sourceChannelId = sourceChannel.uuid().toString();
        const sourceObserver: (resolve: any, reject: any) => Observer<ArrayBuffer> = (resolve, reject) => {
            return {
                next: async messagePayload => {
                    if (this.log.isTraceEnabled()) {
                        this.log.trace(`Propogating message of ${messagePayload.byteLength} from [${sourceChannelId}] to [${targetChannelId}]`);
                    }
                    try {
                        targetChannel.sendMessage(messagePayload);
                    } catch (e) {
                        this.log.error("Unable to send message", e);
                        reject(e);
                    }
                },
                complete: () => {
                    this.log.trace(`Source channel completed`);
                    resolve();
                },
                error: e => {
                    this.log.error(`Received error from source channel [${sourceChannelId}]`, e);
                    reject(e);
                }
            };
        };
        if (Types.isObservable(source)) {
            return new Promise<void>((resolve, reject) => {
                source.subscribe(sourceObserver(resolve, reject));
            });
        } else {
            return new Promise<void>((resolve, reject) => {
                source.setObserver(sourceObserver(resolve, reject));
            });
        }
    }

    private createInvocationStartRequested(methodReference: ConsumedMethodReference | ProvidedMethodReference, sourceConnection: ApplicationConnectionDescriptor): plexus.interop.protocol.IInvocationStartRequested {
        return {
            serviceId: Types.isConsumedMethodReference(methodReference) ?
                (methodReference.consumedService as plexus.interop.protocol.IConsumedServiceReference).serviceId :
                (methodReference.providedService as plexus.interop.protocol.IProvidedServiceReference).serviceId,
            methodId: methodReference.methodId,
            consumerApplicationId: sourceConnection.applicationId,
            consumerConnectionId: sourceConnection.connectionId
        };
    }

    private async resolveTargetConnection(methodReference: ConsumedMethodReference | ProvidedMethodReference, sourceConnection: ApplicationConnectionDescriptor): Promise<ApplicationConnection> {
        if (!Types.isConsumedMethodReference(methodReference)) {
            throw new Error("Provided methods not implemented yet");
        } else {
            const targetMethods = this.registryService.getMatchingProvidedMethods(sourceConnection.applicationId, methodReference);
            const targetAppIds = targetMethods.map(method => method.providedService.application.id);
            const appConnection = await this.appLifeCycleManager.getOrSpawnConnectionForOneOf(targetAppIds);
            return appConnection;
        }
    }


}