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
import { GenericClientApi, StreamingInvocationClient, ValueHandler, InvocationClient, MethodDiscoveryResponse, MethodDiscoveryRequest, DiscoveredMethod, InvocationObserver } from '@plexus-interop/client';
import { InvocationRequestInfo, Completion } from "@plexus-interop/protocol";
import { ConsumedMethod, ProvidedMethod } from "@plexus-interop/broker";
import { ProvidedMethodReference } from "@plexus-interop/client-api";
import { Observer } from "@plexus-interop/common";
import { ServerStreamingStringHandler, UnaryStringHandler, BidiStreamingStringHandler } from "./StringHandlers";
import { clientProtocol as plexus } from "@plexus-interop/protocol";


export interface InteropClient {

    // core

    getConnectionStrId(): string; 

    discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse>;

    discoverAllMethods(consumedMethod: ConsumedMethod): Promise<MethodDiscoveryResponse>;

    disconnect(): Promise<void>;

    createDefaultPayload(messageId: string): string;

    validateRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod | ProvidedMethod, payload: string): void;

    resetInvocationHandlers(): void;

    // unary

    sendUnaryRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, requestJson: string, responseHandler: ValueHandler<string>): Promise<InvocationClient>;

    setUnaryActionHandler(serviceId: string, methodId: string, handler: UnaryStringHandler): void;

    // server streaming

    sendServerStreamingRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, requestJson: string, responseObserver: InvocationObserver<string>): Promise<InvocationClient>;

    setServerStreamingActionHandler(serviceId: string, methodId: string, handler: ServerStreamingStringHandler): void;

    // bidi streaming

    sendBidiStreamingRequest(methodToInvoke: DiscoveredMethod | ConsumedMethod, responseObserver: InvocationObserver<string>): Promise<StreamingInvocationClient<string>>;

    setBidiStreamingActionHandler(serviceId: string, methodId: string, handler: BidiStreamingStringHandler): void;    

}