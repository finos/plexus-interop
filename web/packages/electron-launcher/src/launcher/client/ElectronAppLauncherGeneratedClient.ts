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
import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, InvocationObserver } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer, ConversionObserver } from "@plexus-interop/common";

import * as plexus from "../gen/plexus-messages";
import { GenericRequest } from "@plexus-interop/client-api";

/**
 * Main client API
 *
 */
export abstract class ElectronAppLauncherClient {


    public abstract sendUnaryRequest(invocationInfo: InvocationRequestInfo, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient>;

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
class ElectronAppLauncherClientImpl implements ElectronAppLauncherClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
    ) { }

    public sendUnaryRequest(invocationInfo: GenericRequest, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        return this.genericClient.sendUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType);
    }

    public sendRawUnaryRequest(invocationInfo: GenericRequest, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        return this.genericClient.sendRawUnaryRequest(invocationInfo, request, responseHandler);
    }

    public sendServerStreamingRequest(invocationInfo: GenericRequest, request: any, responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        return this.genericClient.sendServerStreamingRequest(invocationInfo, request, responseObserver, requestType, responseType);
    }

    public sendRawServerStreamingRequest(
        invocationInfo: GenericRequest,
        request: ArrayBuffer,
        responseObserver: InvocationObserver<ArrayBuffer>): Promise<InvocationClient> {
        return this.genericClient.sendRawServerStreamingRequest(invocationInfo, request, responseObserver);
    }

    public sendBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>> {
        return this.genericClient.sendBidirectionalStreamingRequest(invocationInfo, responseObserver, requestType, responseType);
    }

    public sendRawBidirectionalStreamingRequest(methodReference: ProvidedMethodReference, responseObserver: InvocationObserver<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
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
 * Client invocation handler for AppLauncherService, to be implemented by Client
 *
 */
export abstract class AppLauncherServiceInvocationHandler {

    public abstract onLaunch(invocationContext: MethodInvocationContext, request: plexus.interop.IAppLaunchRequest): Promise<plexus.interop.IAppLaunchResponse>;

}

/**
 * Internal invocation handler delegate for AppLauncherService
 *
 */
class AppLauncherServiceInvocationHandlerInternal {

    public constructor(private readonly clientHandler: AppLauncherServiceInvocationHandler) {}

    public onLaunch(invocationContext: MethodInvocationContext, request: ArrayBuffer): Promise<ArrayBuffer> {
        const responseToBinaryConverter = (from: plexus.interop.IAppLaunchResponse) => Arrays.toArrayBuffer(plexus.interop.AppLaunchResponse.encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.interop.AppLaunchRequest.decode(new Uint8Array(from));
            return plexus.interop.AppLaunchRequest.toObject(decoded);
        };
        return this.clientHandler
            .onLaunch(invocationContext, requestFromBinaryConverter(request))
            .then(response => responseToBinaryConverter(response));
    }
}

/**
 * Client API builder
 *
 */
export class ElectronAppLauncherClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "interop.ElectronAppLauncher",
        applicationInstanceId: UniqueId.generateNew()
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    private appLauncherServiceHandler: AppLauncherServiceInvocationHandlerInternal;

    public withClientDetails(clientId: ClientConnectRequest): ElectronAppLauncherClientBuilder {
        this.clientDetails = clientId;
        return this;
    }

    public withAppLauncherServiceInvocationsHandler(invocationsHandler: AppLauncherServiceInvocationHandler): ElectronAppLauncherClientBuilder {
        this.appLauncherServiceHandler = new AppLauncherServiceInvocationHandlerInternal(invocationsHandler);
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): ElectronAppLauncherClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<ElectronAppLauncherClient> {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .withUnaryInvocationHandler({
                serviceInfo: {
                    serviceId: "interop.AppLauncherService"
                },
                handler: {
                    methodId: "Launch",
                    handle: this.appLauncherServiceHandler.onLaunch.bind(this.appLauncherServiceHandler)
                }
            })
            .connect()
            .then(genericClient => new ElectronAppLauncherClientImpl(
                genericClient));
    }
}
