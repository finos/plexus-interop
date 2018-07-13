/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { GenericClientApi, Feature } from './GenericClientApi';
import { GenericClient } from '../../../client/generic/GenericClient';
import { ServiceDiscoveryRequest } from '@plexus-interop/client-api';
import { ServiceDiscoveryResponse } from '@plexus-interop/client-api';
import { ClientDtoUtils } from './../../ClientDtoUtils';
import { StreamingInvocationClient } from './handlers/streaming/StreamingInvocationClient';
import { StreamingInvocationClientImpl } from './handlers/streaming/StreamingInvocationClientImpl';
import { InvocationClient } from './../InvocationClient';
import { ValueHandler } from './../ValueHandler';
import { ClientError } from '@plexus-interop/protocol';
import { InvocationRequestInfo } from '@plexus-interop/protocol';
import { Logger, LoggerFactory, Arrays } from '@plexus-interop/common';
import { MarshallerProvider } from '../io/MarshallerProvider';
import { Completion } from '@plexus-interop/client-api';
import { UniqueId } from '@plexus-interop/transport-common';
import { ProvidedMethodReference } from '@plexus-interop/client-api';
import { Invocation } from '../../generic/Invocation';
import { MethodDiscoveryRequest } from '@plexus-interop/client-api';
import { MethodDiscoveryResponse } from '@plexus-interop/client-api';
import { GenericRequest } from '@plexus-interop/client-api';
import { InvocationObserver } from '../../generic';
import { DelegateInvocationObserver } from '../../api/DelegateInvocationObserver';
import { LoggingInvocationObserver } from '../LoggingInvocationObserver';

export class GenericClientApiImpl implements GenericClientApi {

    private readonly log: Logger = LoggerFactory.getLogger('GenericClientApi');

    constructor(
        private readonly genericClient: GenericClient,
        private readonly marshallerProvider: MarshallerProvider) { }

    public supported(feature: Feature): boolean {
        return true;
    }

    public getConnectionId(): UniqueId {
        return this.genericClient.getConnectionId();
    }

    public discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse> {
        this.log.debug('Service Discovery request');
        return this.genericClient.discoverService(discoveryRequest);
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        this.log.debug('Method Discovery request');
        return this.genericClient.discoverMethod(discoveryRequest);
    }

    public sendRawUnaryRequest(genericRequest: GenericRequest, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        return this.sendUnaryRequestInternal(
            this.toInvocationHash(genericRequest),
            this.requestInvocation(genericRequest),
            request, responseHandler
        );
    }

    public async sendUnaryRequest(genericRequest: GenericRequest, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        const requestMarshaller = this.marshallerProvider.getMarshaller(requestType);
        const responseMarshaller = this.marshallerProvider.getMarshaller(responseType);
        return this.sendRawUnaryRequest(genericRequest,
            Arrays.toArrayBuffer(requestMarshaller.encode(request)),
            {
                value: (responsePayload: ArrayBuffer) => responseHandler.value(responseMarshaller.decode(new Uint8Array(responsePayload))),
                error: responseHandler.error
            });
    }

    public sendRawServerStreamingRequest(
        genericRequest: GenericRequest,
        request: ArrayBuffer,
        responseObserver: InvocationObserver<ArrayBuffer>): Promise<InvocationClient> {
        return this.sendServerStreamingRequestInternal(
            this.toInvocationHash(genericRequest),
            this.requestInvocation(genericRequest),
            request,
            responseObserver
        );
    }

    public async sendServerStreamingRequest(
        genericRequest: GenericRequest,
        request: any,
        responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        const requestMarshaller = this.marshallerProvider.getMarshaller(requestType);
        const responseMarshaller = this.marshallerProvider.getMarshaller(responseType);
        const encoded = Arrays.toArrayBuffer(requestMarshaller.encode(request));
        return this.sendRawServerStreamingRequest(genericRequest, encoded, {
            next: res => responseObserver.next(responseMarshaller.decode(new Uint8Array(res))),
            complete: () => responseObserver.complete(),
            error: e => responseObserver.error(e),
            streamCompleted: () => responseObserver.streamCompleted()
        });
    }

    public sendRawBidirectionalStreamingRequest(request: GenericRequest, responseObserver: InvocationObserver<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        return this.sendBidirectionalStreamingRequestInternal(
            this.toInvocationHash(request),
            this.requestInvocation(request),
            responseObserver
        );
    }

    public async sendBidirectionalStreamingRequest(genericRequest: GenericRequest, responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>> {
        const requestMarshaller = this.marshallerProvider.getMarshaller(requestType);
        const responseMarshaller = this.marshallerProvider.getMarshaller(responseType);
        const baseClient: StreamingInvocationClient<ArrayBuffer> = await this.sendRawBidirectionalStreamingRequest(genericRequest, {
            next: (responsePayload: ArrayBuffer) => responseObserver.next(responseMarshaller.decode(new Uint8Array(responsePayload))),
            error: responseObserver.error.bind(responseObserver),
            complete: responseObserver.complete.bind(responseObserver),
            streamCompleted: responseObserver.streamCompleted.bind(responseObserver)
        }
        );
        return {
            error: baseClient.error.bind(baseClient),
            cancel: baseClient.cancel.bind(baseClient),
            next: (request: any) => baseClient.next(Arrays.toArrayBuffer(requestMarshaller.encode(request))),
            complete: baseClient.complete.bind(baseClient)
        };
    }

    public async sendBidirectionalStreamingRequestInternal(strInfo: string, requestInvocation: () => Promise<Invocation>, responseObserver: InvocationObserver<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        const logger = LoggerFactory.getLogger(`Invocation Request [${strInfo}]`);
        logger.debug(`Sending request for invocation`);
        const invocation = await requestInvocation();
        logger.debug(`Invocation created`);
        await new Promise((resolve, reject) => {
            invocation.open(
                new DelegateInvocationObserver(new LoggingInvocationObserver(responseObserver, logger),
                    s => resolve(s),
                    e => reject(e)));
        });
        logger.debug('Invocation opened');
        return new StreamingInvocationClientImpl(invocation, logger);
    }

    public async sendServerStreamingRequestInternal(
        strInfo: string,
        requestInvocation: () => Promise<Invocation>,
        request: ArrayBuffer,
        responseObserver: InvocationObserver<ArrayBuffer>): Promise<InvocationClient> {
        const streamingClient = await this.sendBidirectionalStreamingRequestInternal(strInfo, requestInvocation, responseObserver);
        await streamingClient.next(request);
        streamingClient.complete().catch(e => responseObserver.error(e));
        return streamingClient;
    }

    public async sendUnaryRequestInternal(
        strInfo: string,
        requestInvocation: () => Promise<Invocation>,
        request: ArrayBuffer,
        responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        const responseObserver = this.createUnaryObserver(responseHandler);
        return this.sendServerStreamingRequestInternal(strInfo, requestInvocation, request, responseObserver);
    }

    public disconnect(completion?: Completion): Promise<void> {
        return this.genericClient.disconnect(completion);
    }

    private isDiscovered(request: InvocationRequestInfo | ProvidedMethodReference): request is ProvidedMethodReference {
        return !!(request as ProvidedMethodReference).providedService;
    }

    private toInvocationHash(request: InvocationRequestInfo | ProvidedMethodReference): string {
        return this.isDiscovered(request) ?
            ClientDtoUtils.targetInvocationHash(ClientDtoUtils.providedMethodToInvocationInfo(request))
            : ClientDtoUtils.targetInvocationHash(request);
    }

    private requestInvocation(request: InvocationRequestInfo | ProvidedMethodReference): () => Promise<Invocation> {
        return this.isDiscovered(request) ?
            () => this.genericClient.requestDiscoveredInvocation(request)
            : () => this.genericClient.requestInvocation(request);
    }

    private createUnaryObserver(responseHandler: ValueHandler<ArrayBuffer>): InvocationObserver<ArrayBuffer> {
        let result: ArrayBuffer | null = null;
        return {
            next: v => {
                this.log.trace(`Received value of ${v.byteLength} bytes`);
                result = v;
            },
            streamCompleted: () => this.log.trace('Incoming stream completed'),
            error: responseHandler.error.bind(responseHandler),
            complete: () => {
                if (result === null) {
                    const errorText = 'No messages received before completion';
                    this.log.error(errorText);
                    responseHandler.error(new ClientError(errorText));
                } else {
                    responseHandler.value(result);
                }
                this.log.debug('Unary operation completed');
            }
        };
    }

}