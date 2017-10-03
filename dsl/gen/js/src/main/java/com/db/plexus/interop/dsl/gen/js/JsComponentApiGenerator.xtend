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
package com.db.plexus.interop.dsl.gen.js

import com.db.plexus.interop.dsl.gen.CodeOutputGenerator
import com.db.plexus.interop.dsl.gen.EntryPoint
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.Application
import java.util.List
import org.eclipse.emf.ecore.resource.Resource
import com.db.plexus.interop.dsl.gen.ApplicationCodeGenerator
import static extension com.db.plexus.interop.dsl.gen.InteropLangUtils.*
import com.google.inject.Inject
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.emf.ecore.EObject
import com.db.plexus.interop.dsl.ConsumedMethod
import com.db.plexus.interop.dsl.protobuf.Method
import javax.inject.Named

@Named
class JsComponentApiGenerator implements ApplicationCodeGenerator {

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

        val namespace = genConfig.namespace

        '''
«imports(genConfig)»

«FOR consumedService : consumedServices »
    /**
     *  Internal Proxy implementation for «consumedService.service.name» service
     */
    export class «consumedService.service.name»Proxy {

        constructor(genericClient) {
            this.genericClient = genericClient;
        }

        «FOR consumedMethod : consumedService.methods SEPARATOR "\n"»
        «clientMethodSignature(consumedMethod, genConfig)» {
            «clientMethodImpl(consumedMethod.method, genConfig)»
        }
        «ENDFOR»

    }
«ENDFOR»

/**
 * Client's API internal implementation
 *
 */
class «app.name»Client {

   constructor(
        genericClient«IF !consumedServices.isEmpty»,«ENDIF»
        «FOR consumedService : consumedServices SEPARATOR ',\n' »
        «consumedService.service.name.toFirstLower»Proxy
        «ENDFOR»
    ) {
        this.genericClient = genericClient;
        «FOR consumedService : consumedServices SEPARATOR ',\n' »
        this.«consumedService.service.name.toFirstLower»Proxy = «consumedService.service.name.toFirstLower»Proxy;
        «ENDFOR»
    }

    «FOR consumedService : consumedServices SEPARATOR '\n' »
    get«consumedService.service.name»Proxy() {
        return this.«consumedService.service.name.toFirstLower»Proxy;
    }
    «ENDFOR»

    discoverService(discoveryRequest) {
        return this.genericClient.discoverService(discoveryRequest);
    }

    discoverMethod(discoveryRequest) {
        return this.genericClient.discoverMethod(discoveryRequest);
    }

    sendDiscoveredUnaryRequest(methodReference, request, responseHandler) {
        return this.genericClient.sendDiscoveredUnaryRequest(methodReference, request, responseHandler);
    }

    sendDiscoveredBidirectionalStreamingRequest(methodReference, responseObserver) {
        return this.genericClient.sendDiscoveredBidirectionalStreamingRequest(methodReference, responseObserver);
    }

    sendDiscoveredServerStreamingRequest(
        methodReference,
        request,
        responseObserver) {
        return this.genericClient.sendDiscoveredServerStreamingRequest(methodReference, request, responseObserver);
    }

    disconnect(completion) {
        return this.genericClient.disconnect(completion);
    }

    sendUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType) {
        return this.genericClient.sendDynamicUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType);
    }

    sendStreamingRequest(invocationInfo, responseObserver, requestType, responseType) {
        return this.genericClient.sendDynamicBidirectionalStreamingRequest(invocationInfo, responseObserver, requestType, responseType);
    }

}

«FOR providedService : providedServices »
    /**
     * Client invocation handler for «providedService.service.name», to be implemented by Client
     *
     */
    export class «providedService.service.name»InvocationHandler {

        «FOR providedMethod : providedService.methods SEPARATOR "\n"»
        «clientHandlerSignature(providedMethod.method, genConfig)» {
            //TODO implement handler
        }
        «ENDFOR»
    }
«ENDFOR»

«FOR providedService : providedServices »
    /**
     * Internal invocation handler delegate for «providedService.service.name»
     *
     */
    class «providedService.service.name»InvocationHandlerInternal extends «providedService.service.name»InvocationHandler {

        constructor(clientHandler) {
            this.clientHandler = clientHandler;
        }
        «FOR providedMethod : providedService.methods SEPARATOR '\n'»
        «genericClientHandlerSignature(providedMethod.method, genConfig)» {
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

    constructor() {
        this.clientDetails = {
            applicationId: "«app.fullName»",
            applicationInstanceId: UniqueId.generateNew()
        };
    }

    withClientDetails(clientId) {
        this.clientDetails = clientId;
        return this;
    }

    «FOR providedMethod : providedServices SEPARATOR '\n' »
    with«providedMethod.service.name»InvocationsHandler(invocationsHandler) {
        this.«providedMethod.service.name.toFirstLower»Handler = new «providedMethod.service.name»InvocationHandlerInternal(invocationsHandler);
        return this;
    }
    «ENDFOR»

    withTransportConnectionProvider(provider) {
        this.transportConnectionProvider = provider;
        return this;
    }

    connect() {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            «FOR providedService : providedServices »
                «FOR providedMethod : providedService.methods»
                    «invocationHandlerBuilder(providedMethod.method, genConfig)»
                «ENDFOR»
            «ENDFOR»
            .connect()
            .then(genericClient => new «app.name»Client(
                genericClient«IF !consumedServices.isEmpty»,«ENDIF»
                «FOR consumedService : consumedServices SEPARATOR ",\n"»
                new «consumedService.service.name»Proxy(genericClient)
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
import { Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer, ConversionObserver } from "@plexus-interop/common";

import * as plexus from "«genConfig.getExternalDependencies().get(0)»";
    '''

    def clientMethodSignature(ConsumedMethod methodLink, PlexusGenConfig genConfig) {
        clientMethodSignature(methodLink.method, genConfig)
    }

    def clientMethodSignature(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: '''«rpcMethod.name.toFirstLower»(request)'''
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: '''«rpcMethod.name.toFirstLower»(responseObserver)'''
            case rpcMethod.isServerStreaming: '''«rpcMethod.name.toFirstLower»(request, responseObserver)'''
        }
    }

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
            this.genericClient.sendUnaryRequest(invocationInfo, requestToBinaryConverter(request), {
                value: (responsePayload) => {
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
        return this.genericClient.sendBidirectionalStreamingRequest(
            invocationInfo,
            new ConversionObserver(responseObserver, responseFromBinaryConverter))
            .then(baseClient =>  {
                return {
                    next: (request) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    '''

    def serverStreamingImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «clientConverters(rpcMethod, genConfig)»
        «clientInvocationInfo(rpcMethod, genConfig)»
        return this.genericClient.sendServerStreamingRequest(
            invocationInfo,
            requestToBinaryConverter(request),
            new ConversionObserver(responseObserver, responseFromBinaryConverter));
    '''

    def clientConverters(Method rpcMethod, PlexusGenConfig genConfig) '''
        const requestToBinaryConverter = (from) => Arrays.toArrayBuffer(«requestTypeImpl(rpcMethod, genConfig)».encode(from).finish());
        const responseFromBinaryConverter = (from) => {
            const decoded = «responseTypeImpl(rpcMethod, genConfig)».decode(new Uint8Array(from));
            return «responseTypeImpl(rpcMethod, genConfig)».toObject(decoded);
        };
     '''

    def clientInvocationInfo(Method rpcMethod, PlexusGenConfig genConfig) '''
        const invocationInfo = {
            methodId: "«rpcMethod.name»",
            serviceId: "«rpcMethod.service.fullName»"
        };
    '''

    def clientHandlerSignature(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: '''on«rpcMethod.name»(request)'''
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: '''on«rpcMethod.name»(hostClient)'''
            case rpcMethod.isServerStreaming: '''on«rpcMethod.name»(request, hostClient)'''
        }
    }

    def genericClientHandlerSignature(Method rpcMethod, PlexusGenConfig genConfig) {
        switch (rpcMethod) {
            case rpcMethod.isPointToPoint: '''on«rpcMethod.name»(request)'''
            case rpcMethod.isBidiStreaming
                    || rpcMethod.isClientStreaming: '''on«rpcMethod.name»(hostClient)'''
            case rpcMethod.isServerStreaming: '''on«rpcMethod.name»(request, hostClient)'''
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
            .on«rpcMethod.name»(requestFromBinaryConverter(request))
            .then(response => responseToBinaryConverter(response));
    '''

    def handlerBidiStreamingImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «handlerConverters(rpcMethod, genConfig)»
        const baseObserver = this.clientHandler
            .on«rpcMethod.name»({
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
        return {
            next: (value) => baseObserver.next(requestFromBinaryConverter(value)),
            complete: baseObserver.complete.bind(baseObserver),
            error: baseObserver.error.bind(baseObserver)
        };
    '''

    def handlerServerStreamingImpl(Method rpcMethod, PlexusGenConfig genConfig) '''
        «handlerConverters(rpcMethod, genConfig)»
        this.clientHandler
            .on«rpcMethod.name»(requestFromBinaryConverter(request), {
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
    '''

    def handlerConverters(Method rpcMethod, PlexusGenConfig genConfig) '''
        const responseToBinaryConverter = (from) => Arrays.toArrayBuffer(«responseTypeImpl(rpcMethod, genConfig)».encode(from).finish());
        const requestFromBinaryConverter = (from) => {
            const decoded = «requestTypeImpl(rpcMethod, genConfig)».decode(new Uint8Array(from));
            return «requestTypeImpl(rpcMethod, genConfig)».toObject(decoded);
        };
    '''
}