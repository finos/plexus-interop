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
import { ServiceDiscoveryRequest } from '@plexus-interop/client-api';
import { ServiceDiscoveryResponse } from '@plexus-interop/client-api';
import { StreamingInvocationClient } from './handlers/streaming/StreamingInvocationClient';
import { InvocationClient } from './../InvocationClient';
import { ValueHandler } from './../ValueHandler';
import { InvocationRequestInfo } from '@plexus-interop/protocol';
import { Completion } from '@plexus-interop/client-api';
import { MethodDiscoveryRequest } from '@plexus-interop/client-api';
import { MethodDiscoveryResponse } from '@plexus-interop/client-api';
import { GenericRequest } from '@plexus-interop/client-api';
import { UniqueId } from '@plexus-interop/transport-common';
import { InvocationObserver } from '../../generic';

export enum Feature {
    SEND_UNARY = 'SEND_UNARY',
    SEND_RAW_UNARY = 'SEND_RAW_UNARY',
    SEND_BIDI_STREAM = 'SEND_BIDI_STREAM',
    SEND_RAW_BIDI_STREAM = 'SEND_RAW_BIDI_STREAM',
    SEND_SERVER_STREAM = 'SEND_SERVER_STREAM',
    SEND_RAW_SERVER_STREAM = 'SEND_RAW_SERVER_STREAM',
    DISCOVER_SERVICE = 'DISCOVER_SERVICE',
    DISCOVER_METHOD = 'DISCOVER_METHOD'
}

export interface GenericClientApi {

    getConnectionId(): UniqueId;

    sendUnaryRequest(invocationInfo: GenericRequest, request: any, responseHandler: ValueHandler<any>, requestType: any, responseType: any): Promise<InvocationClient>;

    sendRawUnaryRequest(invocationInfo: GenericRequest, request: ArrayBuffer, responseHandler: ValueHandler<ArrayBuffer>): Promise<InvocationClient>;

    sendBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<StreamingInvocationClient<any>>;
    
    sendRawBidirectionalStreamingRequest(invocationInfo: GenericRequest, responseObserver: InvocationObserver<ArrayBuffer>): Promise<StreamingInvocationClient<ArrayBuffer>>;
    
    sendServerStreamingRequest(invocationInfo: GenericRequest, request: any, responseObserver: InvocationObserver<any>, requestType: any, responseType: any): Promise<InvocationClient>;
    
    sendRawServerStreamingRequest(
        invocationInfo: InvocationRequestInfo,
        request: ArrayBuffer,
        responseObserver: InvocationObserver<ArrayBuffer>): Promise<InvocationClient>;

    discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse>;

    discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse>;

    disconnect(completion?: Completion): Promise<void>;

    supported(apiFeature: Feature): boolean;

}