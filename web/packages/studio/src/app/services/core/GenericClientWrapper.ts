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
import { InteropClient } from "./InteropClient";
import { GenericClientApi, ValueHandler, InvocationClient, MethodDiscoveryRequest, DiscoveredMethod, StreamingInvocationClient, InvocationObserver } from '@plexus-interop/client';
import { InvocationRequestInfo } from "@plexus-interop/protocol";
import { MethodDiscoveryResponse, ProvidedMethodReference, DiscoveryMode } from '@plexus-interop/client-api';
import { InteropRegistryService, DynamicMarshallerFactory, ProvidedMethod, ConsumedMethod, Marshaller } from "@plexus-interop/broker";
import { DefaultMessageGenerator } from "./DefaultMessageGenerator";
import { UnaryStringHandler, ServerStreamingStringHandler, BidiStreamingStringHandler, wrapGenericHostClient, toGenericObserver } from "./StringHandlers";
import { Observer } from "@plexus-interop/common";
import { clientProtocol as plexus } from "@plexus-interop/protocol";

type DiscoveredMetaInfo = {
    inputMessageId: string,
    outputMessageId: string,
    provided: ProvidedMethodReference,
}

type ConsumedMetaInfo = {
    serviceId: string,
    methodId: string,
    inputMessageId: string,
    outputMessageId: string
}

export class GenericClientWrapper implements InteropClient {

    public constructor(
        private readonly appId: string,
        private readonly genericClient: GenericClientApi,
        private readonly interopRegistryService: InteropRegistryService,
        private readonly encoderProvider: DynamicMarshallerFactory,
        private readonly unaryHandlers: Map<string, UnaryStringHandler>,
        private readonly serverStreamingHandlers: Map<string, ServerStreamingStringHandler>,
        private readonly bidiHandlers: Map<string, BidiStreamingStringHandler>,
        private readonly defaultGenerator: DefaultMessageGenerator) {
    }

    public getConnectionStrId(): string {
        return this.genericClient.getConnectionId().toString();
    }

    public validateRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, payload: string): void {
        const { inputMessageId } = this.toMetaInfo(methodToInvoke);
        const requestEncoder = this.encoderProvider.getMarshaller(inputMessageId);
        const requestData = JSON.parse(payload);
        return requestEncoder.validate(requestData);
    }

    public disconnect(): Promise<void> {
        return this.genericClient.disconnect();
    }

    public setUnaryActionHandler(serviceId: string, methodId: string, handler: (requestJson: string) => Promise<string>): void {
        this.unaryHandlers.set(`${serviceId}.${methodId}`, handler);
    }

    private isConsumed(methodToInvoke: DiscoveredMethod | ConsumedMethod): methodToInvoke is ConsumedMethod {
        return !!(methodToInvoke as ConsumedMethod).consumedService;
    }

    private toMetaInfo(method: DiscoveredMethod | ConsumedMethod): DiscoveredMetaInfo | ConsumedMetaInfo {
        if (this.isConsumed(method)) {
            return {
                inputMessageId: method.method.inputMessage.id,
                outputMessageId: method.method.outputMessage.id,
                serviceId: method.consumedService.service.id,
                methodId: method.method.name
            };
        }
        return {
            inputMessageId: method.inputMessageId as string,
            outputMessageId: method.outputMessageId as string,
            provided: method.providedMethod
        };
    }

    public async sendUnaryRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, requestJson: string, responseHandler: ValueHandler<string>): Promise<InvocationClient> {

        const metaInfo = this.toMetaInfo(methodToInvoke);
        const { inputMessageId, outputMessageId } = metaInfo;

        const requestEncoder = this.encoderProvider.getMarshaller(inputMessageId);
        const responseEncoder = this.encoderProvider.getMarshaller(outputMessageId);

        const requestData = JSON.parse(requestJson);
        requestEncoder.validate(requestData);

        const encodedRequest = requestEncoder.encode(requestData);

        const internalResponseHandler = {
            value: v => responseHandler.value(JSON.stringify(responseEncoder.decode(v))),
            error: e => responseHandler.error(e)
        };

        if (!this.isConsumed(methodToInvoke)) {
            const provided = (metaInfo as DiscoveredMetaInfo).provided;
            return await this.genericClient.sendRawUnaryRequest(
                provided,
                encodedRequest,
                internalResponseHandler);
        } else {
            const consumedMetaInfo = (metaInfo as ConsumedMetaInfo);
            return await this.genericClient.sendRawUnaryRequest({
                serviceId: consumedMetaInfo.serviceId,
                methodId: consumedMetaInfo.methodId
            }, encodedRequest, internalResponseHandler);
        }
    }

    public setBidiStreamingActionHandler(serviceId: string, methodId: string, handler: BidiStreamingStringHandler): void {
        this.bidiHandlers.set(`${serviceId}.${methodId}`, handler);
    }

    public setServerStreamingActionHandler(serviceId: string, methodId: string, handler: ServerStreamingStringHandler): void {
        this.serverStreamingHandlers.set(`${serviceId}.${methodId}`, handler);
    }

    public async sendBidiStreamingRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, responseObserver: InvocationObserver<string>): Promise<StreamingInvocationClient<string>> {

        const metaInfo = this.toMetaInfo(methodToInvoke);
        const { inputMessageId, outputMessageId } = metaInfo;

        const requestEncoder = this.encoderProvider.getMarshaller(inputMessageId);
        const responseEncoder = this.encoderProvider.getMarshaller(outputMessageId);

        const observer = toGenericObserver(responseObserver, responseEncoder);

        if (!this.isConsumed(methodToInvoke)) {
            const provided = (metaInfo as DiscoveredMetaInfo).provided;
            const baseClient = await this.genericClient.sendRawBidirectionalStreamingRequest(provided, observer);
            return wrapGenericHostClient(baseClient, requestEncoder);
        } else {
            const consumedMetaInfo = (metaInfo as ConsumedMetaInfo);
            const baseClient = await this.genericClient.sendRawBidirectionalStreamingRequest({
                serviceId: consumedMetaInfo.serviceId,
                methodId: consumedMetaInfo.methodId
            }, observer);
            return wrapGenericHostClient(baseClient, requestEncoder);
        }
    }

    public sendServerStreamingRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, requestJson: string, responseObserver: InvocationObserver<string>): Promise<InvocationClient> {

        const metaInfo = this.toMetaInfo(methodToInvoke);
        const { inputMessageId, outputMessageId } = metaInfo;

        const requestEncoder = this.encoderProvider.getMarshaller(inputMessageId);
        const responseEncoder = this.encoderProvider.getMarshaller(outputMessageId);

        const requestData = JSON.parse(requestJson);
        requestEncoder.validate(requestData);

        const encodedRequest = requestEncoder.encode(requestData);
        const observer = toGenericObserver(responseObserver, responseEncoder);

        if (!this.isConsumed(methodToInvoke)) {
            const provided = (metaInfo as DiscoveredMetaInfo).provided;
            return this.genericClient.sendRawServerStreamingRequest(provided, encodedRequest, observer);
        } else {
            const consumedMetaInfo = (metaInfo as ConsumedMetaInfo);
            return this.genericClient.sendRawServerStreamingRequest({
                serviceId: consumedMetaInfo.serviceId,
                methodId: consumedMetaInfo.methodId
            }, encodedRequest, observer);
        }
    }

    public createDefaultPayload(messageId: string): string {
        return this.defaultGenerator.generate(messageId);
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        return this.genericClient.discoverMethod(discoveryRequest)
    }

    public async discoverAllMethods(method: ConsumedMethod): Promise<MethodDiscoveryResponse> {
        const consumedMethod = {
            consumedService: {
                serviceId: method.consumedService.service.id
            },
            methodId: method.method.name
        };
        const discoveryRequest = {consumedMethod};
        const discoveredMethods = await this.discoverMethod(discoveryRequest);
        const onlineMethods = await this.discoverMethod({
            ...discoveryRequest,
            discoveryMode: DiscoveryMode.Online
        });
        if (onlineMethods && onlineMethods.methods) {
            onlineMethods.methods.forEach(pm => discoveredMethods.methods.push(pm));
        }
        return discoveredMethods;
    }
}