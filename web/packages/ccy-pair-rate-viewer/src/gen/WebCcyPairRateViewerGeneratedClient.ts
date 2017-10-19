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
import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer, ConversionObserver } from "@plexus-interop/common";

import * as plexus from "./plexus-messages";

/**
 *  Proxy interface of CcyPairRateService service, to be consumed by Client API
 */
export abstract class CcyPairRateServiceProxy {

    public abstract getRate(request: plexus.fx.ICcyPair): Promise<plexus.fx.ICcyPairRate>;

}

/**
 *  Internal Proxy implementation for CcyPairRateService service
 */
export class CcyPairRateServiceProxyImpl implements CcyPairRateServiceProxy {

    constructor(private readonly genericClient: GenericClientApi) { }

    public getRate(request: plexus.fx.ICcyPair): Promise<plexus.fx.ICcyPairRate> {
        const requestToBinaryConverter = (from: plexus.fx.ICcyPair) => Arrays.toArrayBuffer(plexus.fx.CcyPair.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.fx.CcyPairRate.decode(new Uint8Array(from));
            return plexus.fx.CcyPairRate.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "GetRate",
            serviceId: "fx.CcyPairRateService"
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

}

/**
 * Main client API
 *
 */
export abstract class WebCcyPairRateViewerClient {

    public abstract getCcyPairRateServiceProxy(): CcyPairRateServiceProxy;

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
class WebCcyPairRateViewerClientImpl implements WebCcyPairRateViewerClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
        private readonly ccyPairRateServiceProxy: CcyPairRateServiceProxy
    ) { }

    public getCcyPairRateServiceProxy(): CcyPairRateServiceProxy {
        return this.ccyPairRateServiceProxy;
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
export class WebCcyPairRateViewerClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "vendorB.fx.WebCcyPairRateViewer",
        applicationInstanceId: UniqueId.generateNew()
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;


    public withClientDetails(clientId: ClientConnectRequest): WebCcyPairRateViewerClientBuilder {
        this.clientDetails = clientId;
        return this;
    }


    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): WebCcyPairRateViewerClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<WebCcyPairRateViewerClient> {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .connect()
            .then(genericClient => new WebCcyPairRateViewerClientImpl(
                genericClient,
                new CcyPairRateServiceProxyImpl(genericClient)
                ));
    }
}
