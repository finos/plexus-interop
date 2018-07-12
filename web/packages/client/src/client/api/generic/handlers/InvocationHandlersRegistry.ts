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
import { GenericUnaryInvocationHandler } from './GenericUnaryInvocationHandler';
import { GenericBidiStreamingInvocationHandler } from './GenericBidiStreamingInvocationHandler';
import { BidiStreamingInvocationHandler } from '../../streaming/BidiStreamingInvocationHandler';
import { ActionReference } from '@plexus-interop/client-api';
import { MarshallerProvider } from '@plexus-interop/client';
import { UnaryHandlerConverter } from '../../unary/UnaryHandlerConverter';
import { LoggerFactory, Logger } from '@plexus-interop/common';
import { UnaryInvocationHandler } from './UnaryInvocationHandler';
import { toGenericUnaryHandler } from './typedHandlerConverters';

/**
 * Holder for both typed/untyped invocation handlers
 */
export class InvocationHandlersRegistry {

    protected log: Logger = LoggerFactory.getLogger('GenericInvocationHost');

    // tslint:disable-next-line:typedef
    protected readonly typeAwareHandlers = new Map<string, BidiStreamingInvocationHandler<any, any>>();
    // tslint:disable-next-line:typedef
    protected readonly genericHandlers = new Map<string, BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>>();

    public constructor(private readonly marshallerProvider: MarshallerProvider) { }

    public registerUnaryGenericHandler(handler: GenericUnaryInvocationHandler): void {
        this.registerBidiStreamingGenericHandler({
            serviceInfo: handler.serviceInfo,
            handler: new UnaryHandlerConverter<ArrayBuffer, ArrayBuffer>(this.log).convert(handler.handler)
        });
    }

    public registerUnaryHandler(handler: UnaryInvocationHandler<any, any>, requestType: any, responseType: any): void {
        const actionRef: ActionReference = {
            serviceId: handler.serviceInfo.serviceId,
            serviceAlias: handler.serviceInfo.serviceAlias,
            methodId: handler.handler.methodId
        };
        this.typeAwareHandlers.set(this.actionHash(actionRef), {
            methodId: handler.handler.methodId,
            handle: new UnaryHandlerConverter<any, any>(this.log).convert(handler.handler).handle
        });
        this.registerUnaryGenericHandler(toGenericUnaryHandler(handler, requestType, responseType, this.marshallerProvider));
    }

    public registerBidiStreamingGenericHandler(invocationHandler: GenericBidiStreamingInvocationHandler): void {
        const actionRef: ActionReference = {
            serviceId: invocationHandler.serviceInfo.serviceId,
            serviceAlias: invocationHandler.serviceInfo.serviceAlias,
            methodId: invocationHandler.handler.methodId
        };
        this.genericHandlers.set(this.actionHash(actionRef), invocationHandler.handler);
    }

    public getTypeAwareBidiStreamingHandler(actionRef: ActionReference): BidiStreamingInvocationHandler<any, any> | undefined {
        return this.typeAwareHandlers.get(this.actionHash(actionRef));
    }

    public getRawBidiStreamingHandler(actionRef: ActionReference): BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> | undefined {
        return this.genericHandlers.get(this.actionHash(actionRef));
    }

    private actionHash(actionRef: ActionReference): string {
        const alias = actionRef.serviceAlias || 'default';
        return `${actionRef.serviceId}.${alias}.${actionRef.methodId}`;
    }

}