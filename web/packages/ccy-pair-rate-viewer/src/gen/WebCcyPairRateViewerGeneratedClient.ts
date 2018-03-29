import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest, GenericClientApiBase } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer } from "@plexus-interop/common";
import { InvocationObserver, InvocationObserverConverter, ContainerAwareClientAPIBuilder } from "@plexus-interop/client";

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
            this.genericClient.sendRawUnaryRequest(invocationInfo, requestToBinaryConverter(request), {
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
export interface WebCcyPairRateViewerClient extends GenericClientApi  {

    getCcyPairRateServiceProxy(): CcyPairRateServiceProxy;

}

/**
 * Client's API internal implementation
 *
 */
class WebCcyPairRateViewerClientImpl extends GenericClientApiBase implements WebCcyPairRateViewerClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
        private readonly ccyPairRateServiceProxy: CcyPairRateServiceProxy
    ) {
        super(genericClient);
    }

    public getCcyPairRateServiceProxy(): CcyPairRateServiceProxy {
        return this.ccyPairRateServiceProxy;
    }

}



/**
 * Client API builder
 *
 */
export class WebCcyPairRateViewerClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "vendor_b.fx.WebCcyPairRateViewer"
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;


    public withClientDetails(clientId: ClientConnectRequest): WebCcyPairRateViewerClientBuilder {
        this.clientDetails = clientId;
        return this;
    }

    public withAppInstanceId(appInstanceId: UniqueId): WebCcyPairRateViewerClientBuilder {
        this.clientDetails.applicationInstanceId = appInstanceId;
        return this;
    }

    public withAppId(appId: string): WebCcyPairRateViewerClientBuilder {
        this.clientDetails.applicationId = appId;
        return this;
    }


    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): WebCcyPairRateViewerClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<WebCcyPairRateViewerClient> {
        return new ContainerAwareClientAPIBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .connect()
            .then(genericClient => new WebCcyPairRateViewerClientImpl(
                genericClient,
                new CcyPairRateServiceProxyImpl(genericClient)
                ));
    }
}
