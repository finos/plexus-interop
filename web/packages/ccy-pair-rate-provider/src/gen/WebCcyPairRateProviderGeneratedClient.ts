import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest, GenericClientApiBase } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer, ConversionObserver } from "@plexus-interop/common";

import * as plexus from "./plexus-messages";



/**
 * Main client API
 *
 */
export interface WebCcyPairRateProviderClient extends GenericClientApi  {


}

/**
 * Client's API internal implementation
 *
 */
class WebCcyPairRateProviderClientImpl extends GenericClientApiBase implements WebCcyPairRateProviderClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
    ) {
        super(genericClient);
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
