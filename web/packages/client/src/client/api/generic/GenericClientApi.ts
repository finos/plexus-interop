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
import { Observer } from "@plexus-interop/common";
import { ServiceDiscoveryRequest } from "@plexus-interop/client-api";
import { ServiceDiscoveryResponse } from "@plexus-interop/client-api";
import { StreamingInvocationClient } from "./../streaming/StreamingInvocationClient";
import { InvocationClient } from "./../InvocationClient";
import { ValueHandler } from "./../ValueHandler";
import { InvocationRequestInfo } from "@plexus-interop/protocol";
import { Completion } from "@plexus-interop/client-api";
import { MethodDiscoveryRequest } from "@plexus-interop/client-api";
import { MethodDiscoveryResponse } from "@plexus-interop/client-api";
import { ProvidedMethodReference } from "@plexus-interop/client-api";

export interface GenericClientApi {

    sendUnaryRequest(invocationInfo: InvocationRequestInfo, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient>;

    sendDynamicUnaryRequest(invocationInfo: InvocationRequestInfo, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient>;

    sendBidirectionalStreamingRequest(invocationInfo: InvocationRequestInfo, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>>;

    sendDynamicBidirectionalStreamingRequest(invocationInfo: InvocationRequestInfo, responseObserver: Observer<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>>;

    sendServerStreamingRequest(
        invocationInfo: InvocationRequestInfo,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient>;

    discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse>;

    discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse>;

    sendDiscoveredUnaryRequest(methodReference: ProvidedMethodReference, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient>;

    sendDiscoveredBidirectionalStreamingRequest(methodReference: ProvidedMethodReference, responseObserver: Observer<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>>;    

    sendDiscoveredServerStreamingRequest(
        methodReference: ProvidedMethodReference,
        request: ArrayBuffer,
        responseObserver: Observer<ArrayBuffer>): Promise<InvocationClient>;

    disconnect(completion?: Completion): Promise<void>;

}