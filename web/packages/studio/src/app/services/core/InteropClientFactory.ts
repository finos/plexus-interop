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
import { UrlParamsProvider } from './UrlParamsProvider';
import { InteropClient } from "./InteropClient";
import { Injectable } from "@angular/core";
import { TransportConnectionProvider } from "../transport/TransportConnectionProvider";
import { InteropRegistryService, ProvidedMethod, ProvidedService } from "@plexus-interop/broker";
import { GenericClientApiBuilder, MethodType, GenericUnaryInvocationHandler, StreamingInvocationClient, GenericServerStreamingInvocationHandler, GenericBidiStreamingInvocationHandler } from "@plexus-interop/client";
import { UniqueId } from "@plexus-interop/protocol";
import { flatMap, Logger, LoggerFactory, Observer } from "@plexus-interop/common";
import { GenericClientWrapper } from "./GenericClientWrapper";
import { DynamicMarshallerFactory, Marshaller } from "@plexus-interop/broker";
import { DefaultMessageGenerator } from "./DefaultMessageGenerator";

export type UnaryStringHandler = (requestJson: string) => Promise<string>;
export type ServerStreamingStringHandler = (request: string, invocationHostClient: StreamingInvocationClient<string>) => void;
export type BidiStreamingStringHandler = (invocationHostClient: StreamingInvocationClient<string>) => Observer<string>;

@Injectable()
export class InteropClientFactory {

    private readonly log: Logger = LoggerFactory.getLogger("IntropClientFactory");

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

        const marshallerFactory = new DynamicMarshallerFactory(interopRegistryService.getRegistry());
        const defaultGenerator = new DefaultMessageGenerator(interopRegistryService);

        flatMap((ps: ProvidedService) => ps.methods.valuesArray(), providedServices)
            .forEach(pm => {
                const fullName = this.fullName(pm);
                const defaultResponse = defaultGenerator.generate(pm.method.outputMessage.id);
                const requestMarshaller = marshallerFactory.getMarshaller(pm.method.inputMessage.id);
                const responseMarshaller = marshallerFactory.getMarshaller(pm.method.outputMessage.id);
                switch (pm.method.type) {
                    case MethodType.Unary:
                        unaryHandlers.set(fullName, async requestJson => defaultResponse);
                        genericClientBuilder.withUnaryInvocationHandler(this.createUnaryHandler(pm, requestMarshaller, responseMarshaller, unaryHandlers));
                        break;
                    case MethodType.ServerStreaming:
                        serverStreamingHandlers.set(fullName, (request, hostClient) => {
                            hostClient.next(defaultResponse);
                            hostClient.complete();
                        });
                        genericClientBuilder.withServerStreamingInvocationHandler(this.createServerStreamingHandler(pm, requestMarshaller, responseMarshaller, serverStreamingHandlers));
                        break;
                    case MethodType.DuplexStreaming:
                    case MethodType.ClientStreaming:
                        bidiStreamingHandlers.set(fullName, (hostClient) => {
                            let last;
                            return {
                                next: v => hostClient.next(v),
                                complete: () => hostClient.complete(),
                                error: e => {}
                            };
                        });
                        genericClientBuilder.withBidiStreamingInvocationHandler(this.createBidiStreamingHandlers(pm, requestMarshaller, responseMarshaller, bidiStreamingHandlers));
                }

            });

        const client = await genericClientBuilder.connect();

        this.log.info(`Connected as ${appId}`);

        return new GenericClientWrapper(appId, client, interopRegistryService, marshallerFactory, unaryHandlers, defaultGenerator);
    }

    private fullName(pm: ProvidedMethod): string {
        return `${pm.providedService.service.id}.${pm.method.name}`;
    }

    private createUnaryHandler(pm: ProvidedMethod, requestMarshaller: Marshaller<any, ArrayBuffer>,
        responseMarshaller: Marshaller<any, ArrayBuffer>, handlers: Map<string, UnaryStringHandler>): GenericUnaryInvocationHandler {
        const fullName = this.fullName(pm);
        return {
            serviceInfo: {
                serviceId: pm.providedService.service.id
            },
            handler: {
                methodId: pm.method.name,
                handle: async (invocationContext, request) => {
                    const requestObj = requestMarshaller.decode(request);
                    const stringHandler = handlers.get(fullName);
                    const stringResponse = await stringHandler(JSON.stringify(requestObj));
                    return responseMarshaller.encode(JSON.parse(stringResponse));
                }
            }
        }
    }

    private createBidiStreamingHandlers(
        pm: ProvidedMethod,
        requestMarshaller: Marshaller<any, ArrayBuffer>,
        responseMarshaller: Marshaller<any, ArrayBuffer>,
        handlers: Map<string, BidiStreamingStringHandler>): GenericBidiStreamingInvocationHandler {
        const fullName = this.fullName(pm);
        return {
            serviceInfo: {
                serviceId: pm.providedService.service.id
            },
            handler: {
                methodId: pm.method.name,
                handle: (context, hostClient) => {
                    const stringHandler = handlers.get(fullName);
                    const baseObserver = stringHandler(this.wrapHostClient(hostClient, responseMarshaller));
                    let received;
                    return {
                        next: v => { 
                            baseObserver.next(JSON.stringify(requestMarshaller.decode(v)));
                        },
                        error: e => baseObserver.error(e),
                        complete: () => baseObserver.complete()
                    };
                }
            }
        }

    }

    private wrapHostClient(base: StreamingInvocationClient<ArrayBuffer>, responseMarshaller: Marshaller<any, ArrayBuffer>): StreamingInvocationClient<string> {
        return {
            complete: () => base.complete(),
            next: async v => {
                base.next(responseMarshaller.decode(JSON.parse(v)));
            },
            error: e => base.error(e),
            cancel: () => base.cancel()
        };
    }

    private createServerStreamingHandler(
        pm: ProvidedMethod,
        requestMarshaller: Marshaller<any, ArrayBuffer>,
        responseMarshaller: Marshaller<any, ArrayBuffer>,
        handlers: Map<string, ServerStreamingStringHandler>): GenericServerStreamingInvocationHandler {
        const fullName = this.fullName(pm);
        return {
            serviceInfo: {
                serviceId: pm.providedService.service.id
            },
            handler: {
                methodId: pm.method.name,
                handle: async (context, request, hostClient) => {
                    const requestObj = requestMarshaller.decode(request);
                    const stringHandler = handlers.get(fullName);
                    const stringResponse = await stringHandler(JSON.stringify(requestObj), this.wrapHostClient(hostClient, responseMarshaller));
                }
            }
        }
    }

}