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
import { UrlParamsProvider } from '@plexus-interop/common';
import { InteropClient } from './InteropClient';
import { Injectable } from '@angular/core';
import { TransportConnectionProvider } from '../transport/TransportConnectionProvider';
import { InteropRegistryService, ProvidedMethod, ProvidedService } from '@plexus-interop/metadata';
import { GenericClientApiBuilder, MethodType, UnaryInvocationHandler, StreamingInvocationClient, ServerStreamingInvocationHandler, BidiStreamingInvocationHandler, InvocationObserver } from '@plexus-interop/client';
import { UniqueId, ClientError } from '@plexus-interop/protocol';
import { flatMap, Logger, LoggerFactory, Observer } from '@plexus-interop/common';
import { GenericClientWrapper, methodHash } from './GenericClientWrapper';
import { DynamicProtoMarshallerFactory } from '@plexus-interop/io/dist/main/src/dynamic';
import { DefaultMessageGenerator } from './DefaultMessageGenerator';
import { Marshaller } from '@plexus-interop/io';
import { UnaryStringHandler, BidiStreamingStringHandler, ServerStreamingStringHandler, wrapGenericHostClient } from './StringHandlers';

@Injectable()
export class InteropClientFactory {

    private readonly log: Logger = LoggerFactory.getLogger('IntropClientFactory');

    public async connect(
        appId: string,
        interopRegistryService: InteropRegistryService,
        connectionProvider: TransportConnectionProvider): Promise<InteropClient> {

        this.log.info(`Connecting as ${appId}`);

        let genericClientBuilder = new GenericClientApiBuilder();
        let appInstanceId = UrlParamsProvider.getParam('plexusInstanceId');

        if (appInstanceId) {
            this.log.info(`Connecting with ${appInstanceId} instance ID`);
        }

        genericClientBuilder = genericClientBuilder
            .withClientDetails({
                applicationId: appId,
                applicationInstanceId: appInstanceId ? UniqueId.fromString(appInstanceId) : UniqueId.generateNew()
            })
            .withTransportConnectionProvider(connectionProvider);

        const providedServices = interopRegistryService.getProvidedServices(appId);

        const unaryHandlers = new Map<string, UnaryStringHandler>();
        const serverStreamingHandlers = new Map<string, ServerStreamingStringHandler>();
        const bidiStreamingHandlers = new Map<string, BidiStreamingStringHandler>();

        const marshallerFactory = new DynamicProtoMarshallerFactory(interopRegistryService.getRegistry());

        flatMap((ps: ProvidedService) => ps.methods.valuesArray(), providedServices)
            .forEach(pm => {
                const requestMarshaller = marshallerFactory.getMarshaller(pm.method.requestMessage.id);
                const responseMarshaller = marshallerFactory.getMarshaller(pm.method.responseMessage.id);
                switch (pm.method.type) {
                    case MethodType.Unary:
                        genericClientBuilder.withUnaryHandler(this.createUnaryHandler(pm, requestMarshaller, responseMarshaller, unaryHandlers));
                        break;
                    case MethodType.ServerStreaming:
                        genericClientBuilder.withServerStreamingHandler(this.createServerStreamingHandler(pm, requestMarshaller, responseMarshaller, serverStreamingHandlers));
                        break;
                    case MethodType.DuplexStreaming:
                    case MethodType.ClientStreaming:
                        genericClientBuilder.withBidiStreamingHandler(this.createBidiStreamingHandlers(pm, requestMarshaller, responseMarshaller, bidiStreamingHandlers));
                        break;
                }
            });

        const client = await genericClientBuilder.connect();

        this.log.info(`Connected as ${appId}`);

        const clientWrapper = new GenericClientWrapper(
            appId, 
            client, 
            interopRegistryService, 
            marshallerFactory, unaryHandlers, 
            serverStreamingHandlers, 
            bidiStreamingHandlers, new DefaultMessageGenerator(interopRegistryService));
        
        clientWrapper.resetInvocationHandlers();

        return clientWrapper;
    }

    private fullName(pm: ProvidedMethod): string {
        return methodHash({
            serviceId: pm.providedService.service.id,
            serviceAlias: pm.providedService.alias,
            methodId: pm.method.name
        });
    }

    private createUnaryHandler(pm: ProvidedMethod, requestMarshaller: Marshaller<any, ArrayBuffer>,
        responseMarshaller: Marshaller<any, ArrayBuffer>, handlers: Map<string, UnaryStringHandler>): UnaryInvocationHandler<ArrayBuffer, ArrayBuffer> {
        const fullName = this.fullName(pm);
        return {
            serviceInfo: {
                serviceId: pm.providedService.service.id,
                serviceAlias: pm.providedService.alias
            },
            methodId: pm.method.name,
            handle: async (invocationContext, request) => {
                const requestObj = requestMarshaller.decode(request);
                const stringHandler = handlers.get(fullName);
                const stringResponse = await stringHandler(JSON.stringify(requestObj));
                return responseMarshaller.encode(JSON.parse(stringResponse));
            }
        }
    }

    private createBidiStreamingHandlers(
        pm: ProvidedMethod,
        requestMarshaller: Marshaller<any, ArrayBuffer>,
        responseMarshaller: Marshaller<any, ArrayBuffer>,
        handlers: Map<string, BidiStreamingStringHandler>): BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> {
        const fullName = this.fullName(pm);
        return {
            serviceInfo: {
                serviceId: pm.providedService.service.id,
                serviceAlias: pm.providedService.alias
            },
            methodId: pm.method.name,
            handle: (context, hostClient) => {
                const stringHandler = handlers.get(fullName);
                const stringRequestObserver: InvocationObserver<string> = stringHandler(wrapGenericHostClient(hostClient, responseMarshaller));
                let received;
                return {
                    next: (v: ArrayBuffer) => {
                        stringRequestObserver.next(JSON.stringify(requestMarshaller.decode(v)));
                    },
                    error: e => stringRequestObserver.error(e),
                    complete: () => stringRequestObserver.complete(),
                    streamCompleted: () => stringRequestObserver.streamCompleted()
                };
            }
        }
    }

    private createServerStreamingHandler(
        pm: ProvidedMethod,
        requestMarshaller: Marshaller<any, ArrayBuffer>,
        responseMarshaller: Marshaller<any, ArrayBuffer>,
        handlers: Map<string, ServerStreamingStringHandler>): ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> {
        const fullName = this.fullName(pm);
        return {
            serviceInfo: {
                serviceId: pm.providedService.service.id,
                serviceAlias: pm.providedService.alias
            },
            methodId: pm.method.name,
            handle: async (context, request, hostClient) => {
                const requestObj = requestMarshaller.decode(request);
                const stringHandler = handlers.get(fullName);
                const stringResponse = await stringHandler(JSON.stringify(requestObj), wrapGenericHostClient(hostClient, responseMarshaller));
            }
        }
    }

}
