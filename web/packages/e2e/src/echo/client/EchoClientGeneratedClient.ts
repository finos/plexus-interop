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
import { Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest, GenericClientApiBase, InvocationObserverConverter } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer } from "@plexus-interop/common";

import * as plexus from "../gen/plexus-messages";
import { InvocationObserver } from "@plexus-interop/client";

/**
 *  Proxy interface of EchoService service, to be consumed by Client API
 */
export abstract class EchoServiceProxy {

    public abstract unary(request: plexus.plexus.interop.testing.IEchoRequest): Promise<plexus.plexus.interop.testing.IEchoRequest>;

    public abstract serverStreaming(request: plexus.plexus.interop.testing.IEchoRequest, responseObserver: InvocationObserver<plexus.plexus.interop.testing.IEchoRequest>): Promise<InvocationClient>;

    public abstract clientStreaming(responseObserver: InvocationObserver<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>>;

    public abstract duplexStreaming(responseObserver: InvocationObserver<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>>;

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

    public serverStreaming(request: plexus.plexus.interop.testing.IEchoRequest, responseObserver: InvocationObserver<plexus.plexus.interop.testing.IEchoRequest>): Promise<InvocationClient> {
        const requestToBinaryConverter = (from: plexus.plexus.interop.testing.IEchoRequest) => Arrays.toArrayBuffer(plexus.plexus.interop.testing.EchoRequest.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.plexus.interop.testing.EchoRequest.decode(new Uint8Array(from));
            return plexus.plexus.interop.testing.EchoRequest.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "ServerStreaming",
            serviceId: "plexus.interop.testing.EchoService"
        };
        return this.genericClient.sendRawServerStreamingRequest(
            invocationInfo,
            requestToBinaryConverter(request),
            new InvocationObserverConverter<plexus.plexus.interop.testing.IEchoRequest, ArrayBuffer>(responseObserver, responseFromBinaryConverter));
    }

    public clientStreaming(responseObserver: InvocationObserver<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>> {
        const requestToBinaryConverter = (from: plexus.plexus.interop.testing.IEchoRequest) => Arrays.toArrayBuffer(plexus.plexus.interop.testing.EchoRequest.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.plexus.interop.testing.EchoRequest.decode(new Uint8Array(from));
            return plexus.plexus.interop.testing.EchoRequest.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "ClientStreaming",
            serviceId: "plexus.interop.testing.EchoService"
        };
        return this.genericClient.sendRawBidirectionalStreamingRequest(
            invocationInfo,
            new InvocationObserverConverter<plexus.plexus.interop.testing.IEchoRequest, ArrayBuffer>(responseObserver, responseFromBinaryConverter))
            .then(baseClient => {
                return {
                    next: (request: plexus.plexus.interop.testing.IEchoRequest) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    }

    public duplexStreaming(responseObserver: InvocationObserver<plexus.plexus.interop.testing.IEchoRequest>): Promise<StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>> {
        const requestToBinaryConverter = (from: plexus.plexus.interop.testing.IEchoRequest) => Arrays.toArrayBuffer(plexus.plexus.interop.testing.EchoRequest.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.plexus.interop.testing.EchoRequest.decode(new Uint8Array(from));
            return plexus.plexus.interop.testing.EchoRequest.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "DuplexStreaming",
            serviceId: "plexus.interop.testing.EchoService"
        };
        return this.genericClient.sendRawBidirectionalStreamingRequest(
            invocationInfo,
            new InvocationObserverConverter<plexus.plexus.interop.testing.IEchoRequest, ArrayBuffer>(responseObserver, responseFromBinaryConverter))
            .then(baseClient => {
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
export interface EchoClientClient extends GenericClientApi {

    getEchoServiceProxy(): EchoServiceProxy;

}

/**
 * Client's API internal implementation
 *
 */
class EchoClientClientImpl extends GenericClientApiBase implements EchoClientClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
        private readonly echoServiceProxy: EchoServiceProxy
    ) { 
        super(genericClient);
    }

    public getEchoServiceProxy(): EchoServiceProxy {
        return this.echoServiceProxy;
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
