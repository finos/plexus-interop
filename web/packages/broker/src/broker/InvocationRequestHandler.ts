/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { clientProtocol as plexus, SuccessCompletion, ClientProtocolHelper, ErrorCompletion, Completion, UniqueId, ClientProtocolUtils } from '@plexus-interop/protocol';
import { ApplicationConnectionDescriptor } from '../lifecycle/ApplicationConnectionDescriptor';
import { InteropRegistryService } from '@plexus-interop/metadata';
import { AppLifeCycleManager } from '../lifecycle/AppLifeCycleManager';
import { TransportChannel, Defaults, BufferedObserver, PlexusObserver } from '@plexus-interop/transport-common';
import { LoggerFactory, Logger } from '@plexus-interop/common';
import { ConsumedMethodReference } from '@plexus-interop/metadata';
import { ProvidedMethodReference } from '@plexus-interop/metadata';
import { ApplicationConnection } from '../lifecycle/ApplicationConnection';
import { Types } from '../util/Types';

export class InvocationRequestHandler {

    private log: Logger = LoggerFactory.getLogger('InvocationRequestHandler');

    constructor(
        private readonly registryService: InteropRegistryService,
        private readonly appLifeCycleManager: AppLifeCycleManager) { }

    public async handleRequest(
        inMessagesBufferedObserver: BufferedObserver<ArrayBuffer>,
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
                    complete: completion => targetChannelObserver.complete(completion),
                    error: e => targetChannelObserver.error(e),
                    started: () => { },
                    startFailed: e => this.log.error('Failed to start target channel', e)
                });

                this.log.trace(`Sending InvocationStarting to source`);
                sourceChannel.sendMessage(ClientProtocolHelper.invocationStartingMessagePayload({}));

                this.log.trace(`Sending InvocationRequested to [${targetChannelId}]`);
                targetChannel.sendMessage(ClientProtocolHelper.invocationRequestedPayload(this.createInvocationStartRequested(methodReference, sourceConnectionDescriptor)));

                const targetPropogationCompleted = this.propogateAll(inMessagesBufferedObserver, targetChannel, sourceChannel);
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

                this.log.info('Completed');
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

    private async propogateAll(source: BufferedObserver<ArrayBuffer>, targetChannel: TransportChannel, sourceChannel: TransportChannel): Promise<void> {

        const targetChannelId = targetChannel.uuid().toString();
        const sourceChannelId = sourceChannel.uuid().toString();

        const sourceObserver: (resolve: any, reject: any) => PlexusObserver<ArrayBuffer> = (resolve, reject) => {
            return {
                next: async messagePayload => {
                    if (this.log.isTraceEnabled()) {
                        this.log.trace(`[${sourceChannelId}]->[${targetChannelId}] Transferring message of ${messagePayload.byteLength} bytes`);
                    }
                    try {
                        await targetChannel.sendMessage(messagePayload);
                    } catch (e) {
                        this.log.error('Unable to send message', e);
                        reject(e);
                    }
                },
                complete: completion => {
                    if (completion && ClientProtocolUtils.isCancelCompletion(completion)) {
                        this.log.info(`Source channel [${sourceChannelId}] cancelled invocation, sending cancellation close to target [${targetChannelId}]`);
                        targetChannel.close(completion);
                    }
                    this.log.trace(`Source channel [${sourceChannelId}] completed`);
                    resolve();
                },
                error: e => {
                    this.log.error(`Received error from source channel [${sourceChannelId}]`, e);
                    reject(e);
                }
            };
        };

        return new Promise<void>((resolve, reject) => {
            source.setObserver(sourceObserver(resolve, reject));
        });
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
            if (!methodReference.providedService) {
                throw new Error('Provided Service information is required');
            }
            let appConnection;
            if (methodReference.providedService && methodReference.providedService.connectionId) {
                const onlineApps = await this.appLifeCycleManager.getOnlineConnections();
                const connectionId = UniqueId.fromProperties(methodReference.providedService.connectionId as plexus.IUniqueId);
                this.log.trace(`Looking for app by connection id [${connectionId.toString()}]`);
                appConnection = onlineApps.find(a => connectionId.equals(a.connection.uuid()));
            } else if (methodReference.providedService && methodReference.providedService.applicationId) {
                this.log.trace(`Looking for app by app id [${methodReference.providedService.applicationId}]`);
                appConnection = this.appLifeCycleManager.getOrSpawnConnection(methodReference.providedService.applicationId, sourceConnection.instanceId);
            }
            if (!appConnection) {
                throw new Error('Requested application is not online');
            }
            return appConnection;
        } else {
            const targetMethods = this.registryService.getMatchingProvidedMethods(sourceConnection.applicationId, methodReference);
            if (
                targetMethods.length === 1 &&
                targetMethods[0].options.filter(o => o.id === "interop.ProvidedMethodOptions.launch_on_call" && o.value === "ALWAYS").length > 0
            ) {
                const appConnection = await this.appLifeCycleManager.spawnConnection(targetMethods[0].providedService.application.id);
                return appConnection;
            } else {
                const targetAppIds = targetMethods
                    .map(method => method.providedService.application.id);
                const appConnection = await this.appLifeCycleManager.getOrSpawnConnectionForOneOf(targetAppIds, sourceConnection.instanceId);
                return appConnection;
            }
        }
    }
}