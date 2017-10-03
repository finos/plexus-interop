import { Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient } from "@plexus-interop/client";
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
export abstract class CcyPairRateViewerClient {

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
class CcyPairRateViewerClientImpl implements CcyPairRateViewerClient {

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
export class CcyPairRateViewerClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "CcyPairRateViewer",
        applicationInstanceId: UniqueId.generateNew()
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;


    public withClientDetails(clientId: ClientConnectRequest): CcyPairRateViewerClientBuilder {
        this.clientDetails = clientId;
        return this;
    }


    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): CcyPairRateViewerClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<CcyPairRateViewerClient> {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .connect()
            .then(genericClient => new CcyPairRateViewerClientImpl(
                genericClient,
                new CcyPairRateServiceProxyImpl(genericClient)
                ));
    }
}
