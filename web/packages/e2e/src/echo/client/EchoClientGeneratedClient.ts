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
import { Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer, ConversionObserver } from "@plexus-interop/common";

import * as plexus from "../gen/plexus-messages";

/**
 *  Proxy interface of EchoService service, to be consumed by Client API
 */
export abstract class EchoServiceProxy {

    public abstract unary(request: plexus.plexus.interop.testing.IEchoRequest): Promise<plexus.plexus.interop.testing.IEchoRequest>;

    public abstract serverStreaming(request: plexus.plexus.interop.testing.IEchoRequest, responseObserver: Observer<plexus.plexus.interop.testing.IEchoRequest>): Promise<InvocationClient>;

    public abstract clientStreaming(responseObserver: Observer<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>>;

    public abstract duplexStreaming(responseObserver: Observer<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>>;

}

/**
 *  Internal Proxy implementation for EchoService service
 */
export class EchoServiceProxyImpl implements EchoServiceProxy {

    constructor(private readonly genericClient: GenericClientApi) { }

    public unary(request: plexus.plexus.interop.testing.IEchoRequest): Promise<plexus.plexus.interop.testing.IEchoRequest> {
        const requestToBinaryConverter = (from: plexus.plexus.interop.testing.IEchoRequest) => Arrays.toArrayBuffer(plexus.plexus.interop.testing.EchoRequest.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.plexus.interop.testing.EchoRequest.decode(new Uint8Array(from));
            return plexus.plexus.interop.testing.EchoRequest.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "Unary",
            serviceId: "plexus.interop.testing.EchoService"
        };
        return new Promise((resolve, reject) => {
            this.genericClient.sendUnaryRequest(invocationInfo, requestToBinaryConverter(request), {
                value: (responsePayload: ArrayBuffer) => {
                    resolve(responseFromBinaryConverter(responsePayload));
                },
                error: (e) => {
                    reject(e);
                }
            });
        });
    }

    public serverStreaming(request: plexus.plexus.interop.testing.IEchoRequest, responseObserver: Observer<plexus.plexus.interop.testing.IEchoRequest>): Promise<InvocationClient> {
        const requestToBinaryConverter = (from: plexus.plexus.interop.testing.IEchoRequest) => Arrays.toArrayBuffer(plexus.plexus.interop.testing.EchoRequest.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.plexus.interop.testing.EchoRequest.decode(new Uint8Array(from));
            return plexus.plexus.interop.testing.EchoRequest.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "ServerStreaming",
            serviceId: "plexus.interop.testing.EchoService"
        };
        return this.genericClient.sendServerStreamingRequest(
            invocationInfo,
            requestToBinaryConverter(request),
            new ConversionObserver<plexus.plexus.interop.testing.IEchoRequest, ArrayBuffer>(responseObserver, responseFromBinaryConverter));
    }

    public clientStreaming(responseObserver: Observer<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>> {
        const requestToBinaryConverter = (from: plexus.plexus.interop.testing.IEchoRequest) => Arrays.toArrayBuffer(plexus.plexus.interop.testing.EchoRequest.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.plexus.interop.testing.EchoRequest.decode(new Uint8Array(from));
            return plexus.plexus.interop.testing.EchoRequest.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "ClientStreaming",
            serviceId: "plexus.interop.testing.EchoService"
        };
        return this.genericClient.sendBidirectionalStreamingRequest(
            invocationInfo,
            new ConversionObserver<plexus.plexus.interop.testing.IEchoRequest, ArrayBuffer>(responseObserver, responseFromBinaryConverter))
            .then(baseClient =>  {
                return {
                    next: (request: plexus.plexus.interop.testing.IEchoRequest) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    }

    public duplexStreaming(responseObserver: Observer<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>> {
        const requestToBinaryConverter = (from: plexus.plexus.interop.testing.IEchoRequest) => Arrays.toArrayBuffer(plexus.plexus.interop.testing.EchoRequest.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.plexus.interop.testing.EchoRequest.decode(new Uint8Array(from));
            return plexus.plexus.interop.testing.EchoRequest.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "DuplexStreaming",
            serviceId: "plexus.interop.testing.EchoService"
        };
        return this.genericClient.sendBidirectionalStreamingRequest(
            invocationInfo,
            new ConversionObserver<plexus.plexus.interop.testing.IEchoRequest, ArrayBuffer>(responseObserver, responseFromBinaryConverter))
            .then(baseClient =>  {
                return {
                    next: (request: plexus.plexus.interop.testing.IEchoRequest) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    }

}

/**
 * Main client API
 *
 */
export abstract class EchoClientClient {

    public abstract getEchoServiceProxy(): EchoServiceProxy;

    public abstract sendUnaryRequest(invocationInfo: InvocationRequestInfo, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient>;

    public abstract sendStreamingRequest(invocationInfo: InvocationRequestInfo, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>>;

    public abstract discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse>;

    public abstract discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse>;

    public abstract sendDiscoveredUnaryRequest(methodReference: ProvidedMethodReference, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient>;

    public abstract sendDiscoveredBidirectionalStreamingRequest(methodReference: ProvidedMethodReference, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>>;

    public abstract sendDiscoveredServerStreamingRequest(
        methodReference: ProvidedMethodReference,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient>;

    public abstract disconnect(completion?: Completion): Promise<void>;

}

/**
 * Client's API internal implementation
 *
 */
class EchoClientClientImpl implements EchoClientClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
        private readonly echoServiceProxy: EchoServiceProxy
    ) { }

    public getEchoServiceProxy(): EchoServiceProxy {
        return this.echoServiceProxy;
    }

    public discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse> {
        return this.genericClient.discoverService(discoveryRequest);
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        return this.genericClient.discoverMethod(discoveryRequest);
    }

    public sendDiscoveredUnaryRequest(methodReference: ProvidedMethodReference, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        return this.genericClient.sendDiscoveredUnaryRequest(methodReference, request, responseHandler);
    }

    public sendDiscoveredBidirectionalStreamingRequest(methodReference: ProvidedMethodReference, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        return this.genericClient.sendDiscoveredBidirectionalStreamingRequest(methodReference, responseObserver);
    }

    public sendDiscoveredServerStreamingRequest(
        methodReference: ProvidedMethodReference,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient> {
        return this.genericClient.sendDiscoveredServerStreamingRequest(methodReference, request, responseObserver);
    }

    public disconnect(completion?: Completion): Promise<void> {
        return this.genericClient.disconnect(completion);
    }

    public sendUnaryRequest(invocationInfo: InvocationRequestInfo, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        return this.genericClient.sendDynamicUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType);
    }

    public sendStreamingRequest(invocationInfo: InvocationRequestInfo, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>> {
        return this.genericClient.sendDynamicBidirectionalStreamingRequest(invocationInfo, responseObserver, requestType, responseType);
    }

}

/**
 * Client API builder
 *
 */
export class EchoClientClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "plexus.interop.testing.EchoClient",
        applicationInstanceId: UniqueId.generateNew()
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    public withClientDetails(clientId: ClientConnectRequest): EchoClientClientBuilder {
        this.clientDetails = clientId;
        return this;
    }


    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): EchoClientClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<EchoClientClient> {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .connect()
            .then(genericClient => new EchoClientClientImpl(
                genericClient,
                new EchoServiceProxyImpl(genericClient)
                ));
    }
}
