
/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { MethodInvocationContext, GenericClientApiBase, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient } from '@plexus-interop/client';
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from '@plexus-interop/client';
import { TransportConnection, UniqueId } from '@plexus-interop/transport-common';
import { Arrays, Observer, ConversionObserver } from '@plexus-interop/common';

import * as plexus from './gen/plexus-messages';

/**
 * Main client API
 *
 */
export abstract class WebGreetingServerClient {

}

/**
 * Client's API internal implementation
 *
 */
class WebGreetingServerClientImpl extends GenericClientApiBase implements WebGreetingServerClient {

    public constructor(
        private readonly genericClient: GenericClientApi
    ) {
        super(genericClient);
    }


}

/**
 * Client invocation handler for GreetingService, to be implemented by Client
 *
 */
export abstract class GreetingServiceInvocationHandler {

    public abstract onUnary(invocationContext: MethodInvocationContext, request: plexus.interop.samples.IGreetingRequest): Promise<plexus.interop.samples.IGreetingResponse>;

}

/**
 * Internal invocation handler delegate for GreetingService
 *
 */
class GreetingServiceInvocationHandlerInternal {

    public constructor(private readonly clientHandler: GreetingServiceInvocationHandler) {}

    public onUnary(invocationContext: MethodInvocationContext, request: ArrayBuffer): Promise<ArrayBuffer> {
        const responseToBinaryConverter = (from: plexus.interop.samples.IGreetingResponse) => Arrays.toArrayBuffer(plexus.interop.samples.GreetingResponse.encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.interop.samples.GreetingRequest.decode(new Uint8Array(from));
            return plexus.interop.samples.GreetingRequest.toObject(decoded);
        };
        return this.clientHandler
            .onUnary(invocationContext, requestFromBinaryConverter(request))
            .then(response => responseToBinaryConverter(response));
    }
}

/**
 * Client API builder
 *
 */
export class WebGreetingServerClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: 'interop.samples.WebGreetingServer',
        applicationInstanceId: UniqueId.generateNew()
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    private greetingServiceHandler: GreetingServiceInvocationHandlerInternal;

    public withClientDetails(clientId: ClientConnectRequest): WebGreetingServerClientBuilder {
        this.clientDetails = clientId;
        return this;
    }

    public withGreetingServiceInvocationsHandler(invocationsHandler: GreetingServiceInvocationHandler): WebGreetingServerClientBuilder {
        this.greetingServiceHandler = new GreetingServiceInvocationHandlerInternal(invocationsHandler);
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): WebGreetingServerClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<WebGreetingServerClient> {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .withUnaryInvocationHandler({
                serviceInfo: {
                    serviceId: 'interop.samples.GreetingService'
                },
                handler: {
                    methodId: 'Unary',
                    handle: this.greetingServiceHandler.onUnary.bind(this.greetingServiceHandler)
                }
            })
            .connect()
            .then(genericClient => new WebGreetingServerClientImpl(
                genericClient
));
    }
}
