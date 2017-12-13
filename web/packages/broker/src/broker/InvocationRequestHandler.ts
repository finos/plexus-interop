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
import { clientProtocol as plexus, SuccessCompletion, ClientProtocolHelper, ErrorCompletion, Completion } from "@plexus-interop/protocol";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { Observable } from "rxjs/Observable";
import { InteropRegistryService } from "../metadata/interop/InteropRegistryService";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { TransportChannel, Defaults } from "@plexus-interop/transport-common";
import { LoggerFactory, Logger, BufferedObserver, Observer } from "@plexus-interop/common";
import { ConsumedMethodReference } from "../metadata/interop/model/ConsumedMethodReference";
import { ProvidedMethodReference } from "../metadata/interop/model/ProvidedMethodReference";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";
import { Types } from "../util/Types";

export class InvocationRequestHandler {

    private log: Logger = LoggerFactory.getLogger("InvocationRequestHandler");

    constructor(
        private readonly registryService: InteropRegistryService,
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

        try {

            const methodReference: ConsumedMethodReference | ProvidedMethodReference = (invocationRequest.consumedMethod as ConsumedMethodReference) || invocationRequest.providedMethod;
            const targetAppConnection = await this.resolveTargetConnection(methodReference, sourceConnectionDescriptor);

            if (this.log.isDebugEnabled()) {
                this.log.debug(`Target connection [${targetAppConnection.descriptor.connectionId.toString()}] found`);
            }

            const targetChannel = await targetAppConnection.connection.createChannel();

            try {

                const targetChannelId = targetChannel.uuid().toString();
                this.log = LoggerFactory.getLogger(`InvocationRequestHandler ${sourceChannelId}->${targetChannelId}`);
                this.log.debug(`Target channel created`);

                const targetChannelObserver = new BufferedObserver(Defaults.DEFAULT_BUFFER_SIZE, this.log);
                await targetChannel.open({
                    next: m => targetChannelObserver.next(m),
                    complete: () => targetChannelObserver.complete(),
                    error: e => targetChannelObserver.error(e),
                    started: () => { },
                    startFailed: e => this.log.error("Failed to start target channel", e)
                });

                this.log.trace(`Sending InvocationStarting to source`);
                sourceChannel.sendMessage(ClientProtocolHelper.invocationStartingMessagePayload({}));

                this.log.trace(`Sending InvocationRequested to [${targetChannelId}]`);
                targetChannel.sendMessage(ClientProtocolHelper.invocationRequestedPayload(this.createInvocationStartRequested(methodReference, sourceConnectionDescriptor)));

                const targetPropogationCompleted = this.propogateAll($inMessages, targetChannel, sourceChannel);
                const sourcePropogationCompleted = this.propogateAll(targetChannelObserver, sourceChannel, targetChannel);

                await Promise.all([targetPropogationCompleted, sourcePropogationCompleted]);

                this.log.debug(`All messages sent, closing channels`);
                const targetClosed = targetChannel.close();
                const sourceClosed = sourceChannel.close();

                try {
                    await Promise.all([targetClosed, sourceClosed]);
                    this.log.debug(`Channels closed`);
                } catch (error) {
                    this.log.error(`Failed to close channels`, error);
                    return new ErrorCompletion(error);
                }

                this.log.info("Completed");
                return new SuccessCompletion();

            } catch (error) {
                this.log.error(`Communication between channels failed`, error);
                const completion = new ErrorCompletion(error);
                targetChannel.close(completion);
                sourceChannel.close(completion);
                return completion;
            }

        } catch (targetError) {
            this.log.error(`Error on getting target channel`, targetError);
            const completion = new ErrorCompletion(targetError);
            sourceChannel.close(completion);
            return completion;
        }

    }

    private async propogateAll(source: Observable<ArrayBuffer> | BufferedObserver<ArrayBuffer>, targetChannel: TransportChannel, sourceChannel: TransportChannel): Promise<void> {

        const targetChannelId = targetChannel.uuid().toString();
        const sourceChannelId = sourceChannel.uuid().toString();
        
        const sourceObserver: (resolve: any, reject: any) => Observer<ArrayBuffer> = (resolve, reject) => {
            return {
                next: async messagePayload => {
                    if (this.log.isTraceEnabled()) {
                        this.log.trace(`[${sourceChannelId}]->[${targetChannelId}] Transferring message of ${messagePayload.byteLength} bytes`);
                    }
                    try {
                        await targetChannel.sendMessage(messagePayload);
                    } catch (e) {
                        this.log.error("Unable to send message", e);
                        reject(e);
                    }
                },
                complete: () => {
                    this.log.trace(`Source channel [${sourceChannelId}] completed`);
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