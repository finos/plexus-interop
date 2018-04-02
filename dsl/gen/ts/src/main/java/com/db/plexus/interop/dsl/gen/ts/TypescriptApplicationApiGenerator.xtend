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
package com.db.plexus.interop.dsl.gen.ts

import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.Application
import java.util.List
import org.eclipse.emf.ecore.resource.Resource
import com.db.plexus.interop.dsl.gen.ApplicationCodeGenerator
import com.google.inject.Inject
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.emf.ecore.EObject
import com.db.plexus.interop.dsl.ConsumedMethod
import com.db.plexus.interop.dsl.protobuf.Method
import javax.inject.Named
import static extension com.db.plexus.interop.dsl.gen.GenUtils.*

@Named
class TypescriptApplicationApiGenerator extends ApplicationCodeGenerator {

    @Inject
    IQualifiedNameProvider qualifiedNameProvider

    def fullName(EObject obj) {
        return qualifiedNameProvider.getFullyQualifiedName(obj).skipFirst(1).toString()
    }

    def namespace(EObject obj) {
        return qualifiedNameProvider.getFullyQualifiedName(obj).skipFirst(1).skipLast(1).toString()
    }

    override def generate(PlexusGenConfig genConfig, Application app, List<Resource> resources) {

        val consumedServices = app.getConsumedServices
        val providedServices = app.getProvidedServices

        '''
«imports(genConfig)»

«FOR consumedService : consumedServices »
    /**
     *  Proxy interface of «consumedService.service.name» service, to be consumed by Client API
     */
    export abstract class «consumedService.service.name»Proxy {

        «FOR method : consumedService.methods SEPARATOR "\n"»
        public abstract «clientMethodSignature(method, genConfig)»;
        «ENDFOR»

    }
«ENDFOR»

«FOR consumedService : consumedServices »
    /**
     *  Internal Proxy implementation for «consumedService.service.name» service
     */
    export class «consumedService.service.name»ProxyImpl implements «consumedService.service.name»Proxy {

        constructor(private readonly genericClient: GenericClientApi) { }

        «FOR consumedMethod : consumedService.methods SEPARATOR "\n"»
        public «clientMethodSignature(consumedMethod, genConfig)» {
            «clientMethodImpl(consumedMethod.method, genConfig)»
        }
        «ENDFOR»

    }
«ENDFOR»

/**
 * Main client API
 *
 */
export interface «app.name»Client extends GenericClientApi  {

    «FOR consumedService : consumedServices »
    get«consumedService.service.name»Proxy(): «consumedService.service.name»Proxy;
    «ENDFOR»

}

/**
 * Client's API internal implementation
 *
 */
class «app.name»ClientImpl extends GenericClientApiBase implements «app.name»Client {

    public constructor(
        private readonly genericClient: GenericClientApi,
        «FOR consumedService : consumedServices SEPARATOR ',\n' »
        private readonly «consumedService.service.name.toFirstLower»Proxy: «consumedService.service.name»Proxy
        «ENDFOR»
    ) {
        super(genericClient);
    }

    «FOR consumedService : consumedServices SEPARATOR '\n' »
    public get«consumedService.service.name»Proxy(): «consumedService.service.name»Proxy {
        return this.«consumedService.service.name.toFirstLower»Proxy;
    }
    «ENDFOR»

}

«FOR providedService : providedServices »
    /**
     * Client invocation handler for «providedService.service.name», to be implemented by Client
     *
     */
    export abstract class «providedService.service.name»InvocationHandler {

        «FOR providedMethod : providedService.methods»
        public abstract «clientHandlerSignature(providedMethod.method, genConfig)»;

        «ENDFOR»
    }
«ENDFOR»

«FOR providedService : providedServices »
    /**
     * Internal invocation handler delegate for «providedService.service.name»
     *
     */
    class «providedService.service.name»InvocationHandlerInternal {

        public constructor(private readonly clientHandler: «providedService.service.name»InvocationHandler) {}

        «FOR providedMethod : providedService.methods SEPARATOR '\n'»
        public «genericClientHandlerSignature(providedMethod.method, genConfig)» {
            «handlerMethodImpl(providedMethod.method, genConfig)»
        }
        «ENDFOR»
    }
«ENDFOR»

/**
 * Client API builder
 *
 */
export class «app.name»ClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "«app.fullName»"
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    «FOR providedElement : providedServices SEPARATOR '\n' »
        private «providedElement.service.name.toFirstLower»Handler: «providedElement.service.name»InvocationHandlerInternal;
    «ENDFOR»

    public withClientDetails(clientId: ClientConnectRequest): «app.name»ClientBuilder {
        this.clientDetails = clientId;
        return this;
    }

    public withAppInstanceId(appInstanceId: UniqueId): «app.name»ClientBuilder {
        this.clientDetails.applicationInstanceId = appInstanceId;
        return this;
    }

    public withAppId(appId: string): «app.name»ClientBuilder {
        this.clientDetails.applicationId = appId;
        return this;
    }

    «FOR providedMethod : providedServices SEPARATOR '\n' »
    public with«providedMethod.service.name»InvocationsHandler(invocationsHandler: «providedMethod.service.name»InvocationHandler): «app.name»ClientBuilder {
        this.«providedMethod.service.name.toFirstLower»Handler = new «providedMethod.service.name»InvocationHandlerInternal(invocationsHandler);
        return this;
    }
    «ENDFOR»

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): «app.name»ClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<«app.name»Client> {
        return new ContainerAwareClientAPIBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            «FOR providedService : providedServices »
                «FOR providedMethod : providedService.methods»
                    «invocationHandlerBuilder(providedMethod.method, genConfig)»
                «ENDFOR»
            «ENDFOR»
            .connect()
            .then(genericClient => new «app.name»ClientImpl(
                genericClient«IF !consumedServices.isEmpty»,«ENDIF»
                «FOR consumedService : consumedServices SEPARATOR ",\n"»
                new «consumedService.service.name»ProxyImpl(genericClient)
                «ENDFOR»));
    }
}
    '''
    }

    def invocationHandlerBuilder(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: '''
            .withUnaryInvocationHandler({
                «handlerBuilderParam(rpcMethod, genConfig)»
            })
            '''
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: '''
            .withBidiStreamingInvocationHandler({
                «handlerBuilderParam(rpcMethod, genConfig)»
            })
            '''
            case rpcMethod.isServerStreaming: '''
            .withServerStreamingInvocationHandler({
                «handlerBuilderParam(rpcMethod, genConfig)»
            })
            '''
        }
    }

    def handlerBuilderParam(Method rpcMethod, PlexusGenConfig genConfig) '''
    serviceInfo: {
        serviceId: "«rpcMethod.service.fullName»"
    },
    handler: {
        methodId: "«rpcMethod.name»",
        handle: this.«rpcMethod.service.name.toFirstLower»Handler.on«rpcMethod.name».bind(this.«rpcMethod.service.name.toFirstLower»Handler)
    }
    '''

    def imports(PlexusGenConfig genConfig) '''
import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest, GenericClientApiBase } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer } from "@plexus-interop/common";
import { InvocationObserver, InvocationObserverConverter, ContainerAwareClientAPIBuilder } from "@plexus-interop/client";

import * as plexus from "«genConfig.getExternalDependencies().get(0)»";
    '''

    def clientMethodSignature(ConsumedMethod methodLink, PlexusGenConfig genConfig) {
        clientMethodSignature(methodLink.method, genConfig)
    }

    def clientMethodSignature(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: '''«rpcMethod.name.toFirstLower»(request: «requestType(rpcMethod, genConfig)»): Promise<«responseType(rpcMethod, genConfig)»>'''
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: '''«rpcMethod.name.toFirstLower»(responseObserver: InvocationObserver<«responseType(rpcMethod, genConfig)»>): Promise<StreamingInvocationClient<«requestType(rpcMethod, genConfig)»>>'''
            case rpcMethod.isServerStreaming: '''«rpcMethod.name.toFirstLower»(request: «requestType(rpcMethod, genConfig)», responseObserver: InvocationObserver<«responseType(rpcMethod, genConfig)»>): Promise<InvocationClient>'''
        }
    }

    def requestType(Method rpcMethod, PlexusGenConfig genConfig)
    '''«genConfig.namespace».«rpcMethod.request.message.namespace.toLowerCase».I«rpcMethod.request.message.name»'''

    def responseType(Method rpcMethod, PlexusGenConfig genConfig)
    '''«genConfig.namespace».«rpcMethod.response.message.namespace.toLowerCase».I«rpcMethod.response.message.name»'''

    def requestTypeImpl(Method rpcMethod, PlexusGenConfig genConfig)
    '''«genConfig.namespace».«rpcMethod.request.message.namespace.toLowerCase».«rpcMethod.request.message.name»'''

    def responseTypeImpl(Method rpcMethod, PlexusGenConfig genConfig)
    '''«genConfig.namespace».«rpcMethod.response.message.namespace.toLowerCase».«rpcMethod.response.message.name»'''

    def clientMethodImpl(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: clientPointToPointImpl(rpcMethod, genConfig)
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: clientBidiStreamingImpl(rpcMethod, genConfig)
            case rpcMethod.isServerStreaming: serverStreamingImpl(rpcMethod, genConfig)
        }
    }

    def clientPointToPointImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «clientConverters(rpcMethod, genConfig)»
        «clientInvocationInfo(rpcMethod, genConfig)»
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
    '''

    def clientBidiStreamingImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «clientConverters(rpcMethod, genConfig)»
        «clientInvocationInfo(rpcMethod, genConfig)»
        return this.genericClient.sendRawBidirectionalStreamingRequest(
            invocationInfo,
            new InvocationObserverConverter<«responseType(rpcMethod, genConfig)», ArrayBuffer>(responseObserver, responseFromBinaryConverter))
            .then(baseClient =>  {
                return {
                    next: (request: «requestType(rpcMethod, genConfig)») => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    '''

    def serverStreamingImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «clientConverters(rpcMethod, genConfig)»
        «clientInvocationInfo(rpcMethod, genConfig)»
        return this.genericClient.sendRawServerStreamingRequest(
            invocationInfo,
            requestToBinaryConverter(request),
            new InvocationObserverConverter<«responseType(rpcMethod, genConfig)», ArrayBuffer>(responseObserver, responseFromBinaryConverter));
    '''

    def clientConverters(Method rpcMethod, PlexusGenConfig genConfig) '''
        const requestToBinaryConverter = (from: «requestType(rpcMethod, genConfig)») => Arrays.toArrayBuffer(«requestTypeImpl(rpcMethod, genConfig)».encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = «responseTypeImpl(rpcMethod, genConfig)».decode(new Uint8Array(from));
            return «responseTypeImpl(rpcMethod, genConfig)».toObject(decoded);
        };
     '''

    def clientInvocationInfo(Method rpcMethod, PlexusGenConfig genConfig) '''
        const invocationInfo: InvocationRequestInfo = {
            methodId: "«rpcMethod.name»",
            serviceId: "«rpcMethod.service.fullName»"
        };
    '''

    def clientHandlerSignature(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: '''on«rpcMethod.name»(invocationContext: MethodInvocationContext, request: «requestType(rpcMethod, genConfig)»): Promise<«responseType(rpcMethod, genConfig)»>'''
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: '''on«rpcMethod.name»(invocationContext: MethodInvocationContext, hostClient: StreamingInvocationClient<«responseType(rpcMethod, genConfig)»>): InvocationObserver<«requestType(rpcMethod, genConfig)»>'''
            case rpcMethod.isServerStreaming: '''on«rpcMethod.name»(invocationContext: MethodInvocationContext, request: «requestType(rpcMethod, genConfig)», hostClient: StreamingInvocationClient<«responseType(rpcMethod, genConfig)»>): void'''
        }
    }

    def genericClientHandlerSignature(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: '''on«rpcMethod.name»(invocationContext: MethodInvocationContext, request: ArrayBuffer): Promise<ArrayBuffer>'''
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: '''on«rpcMethod.name»(invocationContext: MethodInvocationContext, hostClient: StreamingInvocationClient<ArrayBuffer>): InvocationObserver<ArrayBuffer>'''
            case rpcMethod.isServerStreaming: '''on«rpcMethod.name»(invocationContext: MethodInvocationContext, request: ArrayBuffer, hostClient: StreamingInvocationClient<ArrayBuffer>): void'''
        }
    }

    def handlerMethodImpl(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: handlerPointToPointImpl(rpcMethod, genConfig)
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: handlerBidiStreamingImpl(rpcMethod, genConfig)
            case rpcMethod.isServerStreaming: handlerServerStreamingImpl(rpcMethod, genConfig)
        }
    }

    def handlerPointToPointImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «handlerConverters(rpcMethod, genConfig)»
        return this.clientHandler
            .on«rpcMethod.name»(invocationContext, requestFromBinaryConverter(request))
            .then(response => responseToBinaryConverter(response));
    '''

    def handlerBidiStreamingImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «handlerConverters(rpcMethod, genConfig)»
        const baseObserver = this.clientHandler
            .on«rpcMethod.name»(invocationContext, {
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
        return {
            next: (value) => baseObserver.next(requestFromBinaryConverter(value)),
            complete: baseObserver.complete.bind(baseObserver),
            error: baseObserver.error.bind(baseObserver),
            streamCompleted: baseObserver.streamCompleted.bind(baseObserver)
        };
    '''

    def handlerServerStreamingImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «handlerConverters(rpcMethod, genConfig)»
        this.clientHandler
            .on«rpcMethod.name»(invocationContext, requestFromBinaryConverter(request), {
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
    '''

    def handlerConverters(Method rpcMethod, PlexusGenConfig genConfig) '''
        const responseToBinaryConverter = (from: «responseType(rpcMethod, genConfig)») => Arrays.toArrayBuffer(«responseTypeImpl(rpcMethod, genConfig)».encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = «requestTypeImpl(rpcMethod, genConfig)».decode(new Uint8Array(from));
            return «requestTypeImpl(rpcMethod, genConfig)».toObject(decoded);
        };
    '''
}