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
import { BidiStreamingInvocationHandler, ServerStreamingInvocationHandler } from './streaming';
import { ActionReference } from '@plexus-interop/client-api';
import { UnaryHandlerConverter, toGenericUnaryHandler } from './unary/converters';
import { LoggerFactory, Logger } from '@plexus-interop/common';
import { UnaryInvocationHandler } from './unary/UnaryInvocationHandler';
import { ServerStreamingConverter, toGenericStreamingHandler, toGenericBidiStreamingHandler } from './streaming/converters';
import { BinaryMarshallerProvider } from '@plexus-interop/io';

type HandlerActionRef = {
    serviceInfo: {
        serviceId: string,
        serviceAlias?: string
    },
    methodId: string
};

/**
 * Holder for both typed/untyped invocation handlers
 */
export class InvocationHandlersRegistry {

    protected log: Logger = LoggerFactory.getLogger('InvocationHandler');

    // tslint:disable-next-line:typedef
    protected readonly typeAwareHandlers = new Map<string, BidiStreamingInvocationHandler<any, any>>();
    // tslint:disable-next-line:typedef
    protected readonly genericHandlers = new Map<string, BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>>();

    public constructor(private readonly marshallerProvider: BinaryMarshallerProvider) { }

    public registerServerStreamingHandler(handler: ServerStreamingInvocationHandler<any, any>, requestType: any, responseType: any): void {
        this.typeAwareHandlers.set(
            this.actionHash(this.toActionRef(handler)),
            new ServerStreamingConverter<any, any>(this.log).convert(handler));
        this.registerServerStreamingGenericHandler(toGenericStreamingHandler(handler, requestType, responseType, this.marshallerProvider));
    }

    public registerServerStreamingGenericHandler(handler: ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>): void {
        this.registerBidiStreamingGenericHandler(new ServerStreamingConverter(this.log).convert(handler));
    }

    public registerUnaryGenericHandler(handler: UnaryInvocationHandler<ArrayBuffer, ArrayBuffer>): void {
        this.registerBidiStreamingGenericHandler(new UnaryHandlerConverter<ArrayBuffer, ArrayBuffer>(this.log).convert(handler));
    }

    public registerUnaryHandler(handler: UnaryInvocationHandler<any, any>, requestType: any, responseType: any): void {
        this.typeAwareHandlers.set(
            this.actionHash(this.toActionRef(handler)), 
            new UnaryHandlerConverter<any, any>(this.log).convert(handler));
        this.registerUnaryGenericHandler(toGenericUnaryHandler(handler, requestType, responseType, this.marshallerProvider));
    }

    public registerBidiStreamingHandler(handler: BidiStreamingInvocationHandler<any, any>, requestType: any, responseType: any): void {
        this.registerBidiStreamingGenericHandler(toGenericBidiStreamingHandler(handler, requestType, responseType, this.marshallerProvider));
    }

    public registerBidiStreamingGenericHandler(handler: BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>): void {
        this.genericHandlers.set(this.actionHash(this.toActionRef(handler)), handler);
    }

    public getTypeAwareBidiStreamingHandler(actionRef: ActionReference): BidiStreamingInvocationHandler<any, any> | undefined {
        return this.typeAwareHandlers.get(this.actionHash(actionRef));
    }

    public getRawBidiStreamingHandler(actionRef: ActionReference): BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> | undefined {
        return this.genericHandlers.get(this.actionHash(actionRef));
    }

    private actionHash(actionRef: ActionReference): string {
        return `${actionRef.serviceId}.${actionRef.methodId}`;
    }

    private toActionRef(handlerRef: HandlerActionRef): ActionReference {
        return {
            serviceId: handlerRef.serviceInfo.serviceId,
            serviceAlias: handlerRef.serviceInfo.serviceAlias,
            methodId: handlerRef.methodId
        };
    }

}