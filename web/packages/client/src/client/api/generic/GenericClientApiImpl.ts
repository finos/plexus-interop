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
import { GenericClientApi } from "./GenericClientApi";
import { GenericClient } from "../../../client/generic/GenericClient";
import { ServiceDiscoveryRequest } from "../../../client/api/dto/ServiceDiscoveryRequest";
import { ServiceDiscoveryResponse } from "../../../client/api/dto/ServiceDiscoveryResponse";
import { Observer } from "@plexus-interop/common";
import { ClientDtoUtils } from "./../../ClientDtoUtils";
import { LoggingObserver } from "./../LoggingObserver";
import { StreamingInvocationClient } from "./../streaming/StreamingInvocationClient";
import { StreamingInvocationClientImpl } from "./../streaming/StreamingInvocationClientImpl";
import { InvocationClient } from "./../InvocationClient";
import { ValueHandler } from "./../ValueHandler";
import { ClientError } from "@plexus-interop/protocol";
import { InvocationRequestInfo } from "../../generic/InvocationMetaInfo";
import { Logger, LoggerFactory, Arrays, PrefixedLogger } from "@plexus-interop/common";

import { MarshallerProvider } from "../io/MarshallerProvider";
import { Completion } from "../dto/Completion";
import { DelegateChannelObserver } from "@plexus-interop/transport-common";
import { ProvidedMethodReference } from "../dto/ProvidedMethodReference";
import { Invocation } from "../../generic/Invocation";
import { MethodDiscoveryRequest } from "../dto/MethodDiscoveryRequest";
import { MethodDiscoveryResponse } from "../dto/MethodDiscoveryResponse";

export class GenericClientApiImpl implements GenericClientApi {

    private readonly log: Logger = LoggerFactory.getLogger("GenericClientApi");

    constructor(
        private readonly genericClient: GenericClient,
        private readonly marshallerProvider: MarshallerProvider) { }

    public discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse> {
        this.log.debug("Service Discovery request");
        return this.genericClient.discoverService(discoveryRequest);
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        this.log.debug("Method Discovery request");
        return this.genericClient.discoverMethod(discoveryRequest);
    }

    public sendDiscoveredUnaryRequest(methodReference: ProvidedMethodReference, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        return this.sendUnaryRequestInternal(
            ClientDtoUtils.targetInvocationHash(ClientDtoUtils.providedMethodToInvocationInfo(methodReference)),
            () => this.genericClient.requestDiscoveredInvocation(methodReference),
            request, responseHandler
        );
    }

    public sendDiscoveredServerStreamingRequest(
        methodReference: ProvidedMethodReference,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient> {
        return this.sendServerStreamingRequestInternal(
            ClientDtoUtils.targetInvocationHash(ClientDtoUtils.providedMethodToInvocationInfo(methodReference)),
            () => this.genericClient.requestDiscoveredInvocation(methodReference),
            request,
            responseObserver
        );
    }

    public sendDiscoveredBidirectionalStreamingRequest(methodReference: ProvidedMethodReference, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        return this.sendBidirectionalStreamingRequestInternal(
            ClientDtoUtils.targetInvocationHash(ClientDtoUtils.providedMethodToInvocationInfo(methodReference)),
            () => this.genericClient.requestDiscoveredInvocation(methodReference),
            responseObserver
        );
    }

    public sendBidirectionalStreamingRequest(invocationInfo: InvocationRequestInfo, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        return this.sendBidirectionalStreamingRequestInternal(
            ClientDtoUtils.targetInvocationHash(invocationInfo),
            () => this.genericClient.requestInvocation(invocationInfo),
            responseObserver
        );
    }

    public async sendBidirectionalStreamingRequestInternal(strInfo: string, requestInvocation: () => Promise<Invocation>, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        const logger = new PrefixedLogger(this.log, strInfo);
        logger.debug(`Sending request for invocation`);
        const invocation = await requestInvocation();
        logger.debug(`Invocation created`);
        await new Promise((resolve, reject) => {
            invocation.open(
                new DelegateChannelObserver(new LoggingObserver(responseObserver, logger),
                    (s) => resolve(s),
                    (e) => reject(e)));
        });
        logger.debug("Invocation opened");
        return new StreamingInvocationClientImpl(invocation, logger);
    }

    public async sendServerStreamingRequest(
        invocationInfo: InvocationRequestInfo,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient> {
        return this.sendServerStreamingRequestInternal(
            ClientDtoUtils.targetInvocationHash(invocationInfo),
            () => this.genericClient.requestInvocation(invocationInfo),
            request,
            responseObserver);
    }

    public async sendServerStreamingRequestInternal(
        strInfo: string,
        requestInvocation: () => Promise<Invocation>,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient> {
        const streamingClient = await this.sendBidirectionalStreamingRequestInternal(strInfo, requestInvocation, responseObserver);
        await streamingClient.next(request);
        streamingClient.complete().catch(e => responseObserver.error(e));
        return streamingClient;
    }

    public async sendDynamicUnaryRequest(invocationInfo: InvocationRequestInfo, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        const requestMarshaller = this.marshallerProvider.getMarshaller(requestType);
        const responseMarshaller = this.marshallerProvider.getMarshaller(responseType);
        return this.sendUnaryRequest(invocationInfo,
            Arrays.toArrayBuffer(requestMarshaller.encode(request)),
            {
                value: (responsePayload: ArrayBuffer) => responseHandler.value(responseMarshaller.decode(new Uint8Array(responsePayload))),
                error: responseHandler.error
            });
    }

    public async sendDynamicBidirectionalStreamingRequest(invocationInfo: InvocationRequestInfo, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>> {
        const requestMarshaller = this.marshallerProvider.getMarshaller(requestType);
        const responseMarshaller = this.marshallerProvider.getMarshaller(responseType);
        const baseClient: StreamingInvocationClient<ArrayBuffer> = await this.sendBidirectionalStreamingRequest(invocationInfo, {
            next: (responsePayload: ArrayBuffer) => responseObserver.next(responseMarshaller.decode(new Uint8Array(responsePayload))),
            error: responseObserver.error.bind(responseObserver),
            complete: responseObserver.complete.bind(responseObserver)
        }
        );
        return {
            error: baseClient.error.bind(baseClient),
            cancel: baseClient.cancel.bind(baseClient),
            next: (request: any) => baseClient.next(Arrays.toArrayBuffer(requestMarshaller.encode(request))),
            complete: baseClient.complete.bind(baseClient)
        };
    }

    public async sendUnaryRequest(invocationInfo: InvocationRequestInfo, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        let result: ArrayBuffer | null = null;
        const responseObserver: Observer<ArrayBuffer> = {
            next: (v) => {
                this.log.trace(`Received value of ${v.byteLength} bytes`);
                result = v;
            },
            error: responseHandler.error.bind(responseHandler),
            complete: () => {
                if (result === null) {
                    const errorText = "No messages received before completion";
                    this.log.error(errorText);
                    responseHandler.error(new ClientError(errorText));
                } else {
                    responseHandler.value(result);
                }
                this.log.debug("Unary operation completed");
            }
        };
        return this.sendServerStreamingRequest(invocationInfo, request, responseObserver);
    }

    public async sendUnaryRequestInternal(
        strInfo: string,
        requestInvocation: () => Promise<Invocation>,
        request: ArrayBuffer,
        responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {

        let result: ArrayBuffer | null = null;
        const responseObserver: Observer<ArrayBuffer> = {
            next: (v) => {
                this.log.trace(`Received value of ${v.byteLength} bytes`);
                result = v;
            },
            error: responseHandler.error.bind(responseHandler),
            complete: () => {
                if (result === null) {
                    const errorText = "No messages received before completion";
                    this.log.error(errorText);
                    responseHandler.error(new ClientError(errorText));
                } else {
                    responseHandler.value(result);
                }
                this.log.debug("Unary operation completed");
            }
        };

        return this.sendServerStreamingRequestInternal(strInfo, requestInvocation, request, responseObserver);
    }


    public disconnect(completion?: Completion): Promise<void> {
        return this.genericClient.disconnect(completion);
    }
}