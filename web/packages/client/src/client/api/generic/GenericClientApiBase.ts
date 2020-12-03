/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { GenericClientApi, Feature } from './GenericClientApi';
import { UniqueId, InvocationRequestInfo, Completion } from '@plexus-interop/protocol';
import { GenericRequest, ServiceDiscoveryRequest, MethodDiscoveryRequest, MethodDiscoveryResponse, ServiceDiscoveryResponse } from '@plexus-interop/client-api';
import { ValueHandler, InvocationClient } from '../';
import { StreamingInvocationClient } from './handlers/streaming/StreamingInvocationClient';
import { InvocationObserver } from '../../generic';

/**
 * Base class for all generated clients
 *
 */
export abstract class GenericClientApiBase implements GenericClientApi {

    public constructor(protected readonly client: GenericClientApi) { }

    public getApplicationId(): string {
        return this.client.getApplicationId();
    }

    public getApplicationInstanceId(): UniqueId {
        return this.client.getApplicationInstanceId();
    }

    public supported(apiFeature: Feature): boolean {
        return this.client.supported(apiFeature);
    }

    public getConnectionId(): UniqueId {
        return this.client.getConnectionId();
    }

    public sendUnaryRequest(invocationInfo: GenericRequest, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        return this.client.sendUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType);
    }

    public sendRawUnaryRequest(invocationInfo: GenericRequest, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient> {
        return this.client.sendRawUnaryRequest(invocationInfo, request, responseHandler);
    }

    public sendBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>> {
        return this.client.sendBidirectionalStreamingRequest(invocationInfo, responseObserver, requestType, responseType);
    }

    public sendRawBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: InvocationObserver<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>> {
        return this.client.sendRawBidirectionalStreamingRequest(invocationInfo, responseObserver);
    }

    public sendServerStreamingRequest(invocationInfo: GenericRequest, request: any, responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<InvocationClient> {
        return this.client.sendServerStreamingRequest(invocationInfo, request, responseObserver, requestType, responseType);
    }

    public sendRawServerStreamingRequest(invocationInfo: InvocationRequestInfo, request: ArrayBuffer, responseObserver: InvocationObserver<ArrayBuffer>): Promise<InvocationClient> {
        return this.client.sendRawServerStreamingRequest(invocationInfo, request, responseObserver);
    }

    public discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse> {
        return this.client.discoverService(discoveryRequest);
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        return this.client.discoverMethod(discoveryRequest);
    }

    public disconnect(completion?: Completion | undefined): Promise<void> {
        return this.client.disconnect(completion);
    }

}
