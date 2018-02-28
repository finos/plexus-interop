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
import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer, ConversionObserver } from "@plexus-interop/common";

import * as plexus from "./plexus-messages";



/**
 * Main client API
 *
 */
export abstract class WebCcyPairRateProviderClient {


    public abstract sendUnaryRequest(invocationInfo: GenericRequest, request: any, responseHandler: ValueHandler<any>, requestMarshaller: any, responseType: any): Promise<InvocationClient>;

    public abstract sendRawUnaryRequest(invocationInfo: GenericRequest, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient>;

    public abstract sendServerStreamingRequest(invocationInfo: GenericRequest, request: any, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<InvocationClient>;

    public abstract sendRawServerStreamingRequest(
        invocationInfo: InvocationRequestInfo,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient>;

    public abstract sendBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>>;

    public abstract sendRawBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>>;

    public abstract discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse>;

    public abstract discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse>;

    public abstract disconnect(completion?: Completion): Promise<void>;

}

/**
 * Client's API internal implementation
 *
 */
class WebCcyPairRateProviderClientImpl implements WebCcyPairRateProviderClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
    ) { }


    public sendUnaryRequest(invocationInfo: GenericRequest, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        return this.genericClient.sendUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType);
    }

    public sendRawUnaryRequest(invocationInfo: GenericRequest, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        return this.genericClient.sendRawUnaryRequest(invocationInfo, request, responseHandler);
    }

    public sendServerStreamingRequest(invocationInfo: GenericRequest, request: any, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        return this.genericClient.sendServerStreamingRequest(invocationInfo, request, responseObserver, requestType, responseType);
    }

    public sendRawServerStreamingRequest(
        invocationInfo: GenericRequest,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient> {
        return this.genericClient.sendRawServerStreamingRequest(invocationInfo, request, responseObserver);
    }

    public sendBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>> {
        return this.genericClient.sendBidirectionalStreamingRequest(invocationInfo, responseObserver, requestType, responseType);
    }

    public sendRawBidirectionalStreamingRequest(methodReference: ProvidedMethodReference, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        return this.genericClient.sendRawBidirectionalStreamingRequest(methodReference, responseObserver);
    }

    public discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse> {
        return this.genericClient.discoverService(discoveryRequest);
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        return this.genericClient.discoverMethod(discoveryRequest);
    }

    public disconnect(completion?: Completion): Promise<void> {
        return this.genericClient.disconnect(completion);
    }

}

/**
 * Client invocation handler for CcyPairRateService, to be implemented by Client
 *
 */
export abstract class CcyPairRateServiceInvocationHandler {

    public abstract onGetRate(invocationContext: MethodInvocationContext, request: plexus.fx.ICcyPair): Promise<plexus.fx.ICcyPairRate>;

}

/**
 * Internal invocation handler delegate for CcyPairRateService
 *
 */
class CcyPairRateServiceInvocationHandlerInternal {

    public constructor(private readonly clientHandler: CcyPairRateServiceInvocationHandler) {}

    public onGetRate(invocationContext: MethodInvocationContext, request: ArrayBuffer): Promise<ArrayBuffer> {
        const responseToBinaryConverter = (from: plexus.fx.ICcyPairRate) => Arrays.toArrayBuffer(plexus.fx.CcyPairRate.encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.fx.CcyPair.decode(new Uint8Array(from));
            return plexus.fx.CcyPair.toObject(decoded);
        };
        return this.clientHandler
            .onGetRate(invocationContext, requestFromBinaryConverter(request))
            .then(response => responseToBinaryConverter(response));
    }
}

/**
 * Client API builder
 *
 */
export class WebCcyPairRateProviderClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "vendorA.fx.WebCcyPairRateProvider",
        applicationInstanceId: UniqueId.generateNew()
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    private ccyPairRateServiceHandler: CcyPairRateServiceInvocationHandlerInternal;

    public withClientDetails(clientId: ClientConnectRequest): WebCcyPairRateProviderClientBuilder {
        this.clientDetails = clientId;
        return this;
    }

    public withAppInstanceId(appInstanceId: UniqueId): WebCcyPairRateProviderClientBuilder {
        this.clientDetails.applicationInstanceId = appInstanceId;
        return this;
    }

    public withAppId(appId: string): WebCcyPairRateProviderClientBuilder {
        this.clientDetails.applicationId = appId;
        return this;
    }

    public withCcyPairRateServiceInvocationsHandler(invocationsHandler: CcyPairRateServiceInvocationHandler): WebCcyPairRateProviderClientBuilder {
        this.ccyPairRateServiceHandler = new CcyPairRateServiceInvocationHandlerInternal(invocationsHandler);
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): WebCcyPairRateProviderClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<WebCcyPairRateProviderClient> {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .withUnaryInvocationHandler({
                serviceInfo: {
                    serviceId: "fx.CcyPairRateService"
                },
                handler: {
                    methodId: "GetRate",
                    handle: this.ccyPairRateServiceHandler.onGetRate.bind(this.ccyPairRateServiceHandler)
                }
            })
            .connect()
            .then(genericClient => new WebCcyPairRateProviderClientImpl(
                genericClient
));
    }
}
