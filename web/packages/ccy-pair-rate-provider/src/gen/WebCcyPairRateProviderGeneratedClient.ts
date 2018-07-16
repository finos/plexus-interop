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
import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest, GenericClientApiBase } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer } from "@plexus-interop/common";
import { InvocationObserver, InvocationObserverConverter, ContainerAwareClientAPIBuilder } from "@plexus-interop/client";

import * as plexus from "./plexus-messages";



/**
 * Main client API
 */
export interface WebCcyPairRateProviderClient extends GenericClientApi  {


}

/**
 * Client's API internal implementation
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
 */
export abstract class CcyPairRateServiceInvocationHandler {

    public abstract onGetRate(invocationContext: MethodInvocationContext, request: plexus.fx.ICcyPair): Promise<plexus.fx.ICcyPairRate>;
}

/**
 * Client API builder
 */
export class WebCcyPairRateProviderClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "vendor_a.fx.WebCcyPairRateProvider"
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    private ccyPairRateServiceHandler: CcyPairRateServiceInvocationHandler;

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
        this.ccyPairRateServiceHandler = invocationsHandler;
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): WebCcyPairRateProviderClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<WebCcyPairRateProviderClient> {
        return new ContainerAwareClientAPIBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .withTypeAwareUnaryHandler({
                serviceInfo: {
                    serviceId: "fx.CcyPairRateService"
                },
                methodId: "GetRate",
                handle: this.ccyPairRateServiceHandler.onGetRate.bind(this.ccyPairRateServiceHandler)
            }, plexus.fx.CcyPair, plexus.fx.CcyPairRate)
            .connect()
            .then((genericClient: GenericClientApi) => new WebCcyPairRateProviderClientImpl(
                genericClient
));
    }
}
