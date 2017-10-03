import { ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, ServiceDiscoveryRequest, ServiceDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection } from "@plexus-interop/transport-common";
import { Arrays, Observer, ConversionObserver } from "@plexus-interop/common";

import * as plexus from "./plexus-messages";

/**
*  Internal Proxy implementation for ExampleService service
*/
export class ExampleServiceProxy {

    constructor(genericClient) {
        this.genericClient = genericClient;
    }

    pointToPoint(request) {
        const requestToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Response.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Response.toObject(decoded);
        };
        const invocationInfo = {
            methodId: "PointToPoint",
            serviceId: "com.plexus.services.ExampleService"
        };
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
    }

    serverStreaming(request, responseObserver) {
        const requestToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Response.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Response.toObject(decoded);
        };
        const invocationInfo = {
            methodId: "ServerStreaming",
            serviceId: "com.plexus.services.ExampleService"
        };
        return this.genericClient.sendServerStreamingRequest(
            invocationInfo,
            requestToBinaryConverter(request),
            new ConversionObserver(responseObserver, responseFromBinaryConverter));
    }

    clientToServer(responseObserver) {
        const requestToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Response.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Response.toObject(decoded);
        };
        const invocationInfo = {
            methodId: "ClientToServer",
            serviceId: "com.plexus.services.ExampleService"
        };
        return this.genericClient.sendBidirectionalStreamingRequest(
            invocationInfo,
            new ConversionObserver(responseObserver, responseFromBinaryConverter))
            .then(baseClient => {
                return {
                    next: (request) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    }

    bidiStreaming(responseObserver) {
        const requestToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Response.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Response.toObject(decoded);
        };
        const invocationInfo = {
            methodId: "BidiStreaming",
            serviceId: "com.plexus.services.ExampleService"
        };
        return this.genericClient.sendBidirectionalStreamingRequest(
            invocationInfo,
            new ConversionObserver(responseObserver, responseFromBinaryConverter))
            .then(baseClient => {
                return {
                    next: (request) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    }

}

/**
 * Client's API internal implementation
 *
 */
class ComponentAClient {

    constructor(
        genericClient,
        exampleServiceProxy
    ) {
        this.genericClient = genericClient;
        this.exampleServiceProxy = exampleServiceProxy;
    }

    getExampleServiceProxy() {
        return this.exampleServiceProxy;
    }

    sendUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType) {
        return this.genericClient.sendDynamicUnaryRequest(invocationInfo, request, responseHandler, requestType, responseType);
    }

    sendStreamingRequest(invocationInfo, responseObserver, requestType, responseType) {
        return this.genericClient.sendDynamicBidirectionalStreamingRequest(invocationInfo, responseObserver, requestType, responseType);
    }

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

}

/**
 * Client invocation handler for ExampleService, to be implemented by Client
 *
 */
export class ExampleServiceInvocationHandler {

    onPointToPoint(request) {
        // TODO implement handler
    }

    onServerStreaming(request, hostClient) {
        // TODO implement handler
    }

    onClientToServer(hostClient) {
        // TODO implement handler 
    }

    onBidiStreaming(hostClient) {
        // TODO implement handler
    }

}

/**
 * Internal invocation handler delegate for ExampleService
 *
 */
class ExampleServiceInvocationHandlerInternal extends ExampleServiceInvocationHandler {

    constructor(clientHandler) {
        this.clientHandler = clientHandler;
    }

    onPointToPoint(request) {
        const responseToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Request.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Request.toObject(decoded);
        };
        return this.clientHandler
            .onPointToPoint(requestFromBinaryConverter(request))
            .then(response => responseToBinaryConverter(response));
    }

    onServerStreaming(request, hostClient) {
        const responseToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Request.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Request.toObject(decoded);
        };
        this.clientHandler
            .onServerStreaming(requestFromBinaryConverter(request), {
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
    }

    onClientToServer(hostClient) {
        const responseToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Request.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Request.toObject(decoded);
        };
        return this.clientHandler
            .onClientToServer({
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
    }

    onBidiStreaming(hostClient) {
        const responseToBinaryConverter = (from) => Arrays.toArrayBuffer(plexus.com.plexus.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from) => {
            const decoded = plexus.com.plexus.model.Request.decode(new Uint8Array(from));
            return plexus.com.plexus.model.Request.toObject(decoded);
        };
        return this.clientHandler
            .onBidiStreaming({
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
    }
}

/**
 * Client API builder
 *
 */
export class ComponentAClientBuilder {

    constructor() {
        this.clientDetails = {
            applicationId: "com.plexus.components.ComponentA",
            applicationInstanceId: UniqueId.generateNew()
        };
    }

    withClientDetails(clientId) {
        this.clientDetails = clientId;
        return this;
    }

    withExampleServiceInvocationsHandler(invocationsHandler) {
        this.exampleServiceHandler = new ExampleServiceInvocationHandlerInternal(invocationsHandler);
        return this;
    }

    withTransportConnectionProvider(provider) {
        this.transportConnectionProvider = provider;
        return this;
    }

    connect() {
        return new GenericClientApiBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .withUnaryInvocationHandler({
                serviceInfo: {
                    serviceId: "com.plexus.services.ExampleService"
                },
                handler: {
                    methodId: "PointToPoint",
                    handle: this.exampleServiceHandler.onPointToPoint.bind(this.exampleServiceHandler)
                }
            })
            .withServerStreamingInvocationHandler({
                serviceInfo: {
                    serviceId: "com.plexus.services.ExampleService"
                },
                handler: {
                    methodId: "ServerStreaming",
                    handle: this.exampleServiceHandler.onServerStreaming.bind(this.exampleServiceHandler)
                }
            })
            .withBidiStreamingInvocationHandler({
                serviceInfo: {
                    serviceId: "com.plexus.services.ExampleService"
                },
                handler: {
                    methodId: "ClientToServer",
                    handle: this.exampleServiceHandler.onClientToServer.bind(this.exampleServiceHandler)
                }
            })
            .withBidiStreamingInvocationHandler({
                serviceInfo: {
                    serviceId: "com.plexus.services.ExampleService"
                },
                handler: {
                    methodId: "BidiStreaming",
                    handle: this.exampleServiceHandler.onBidiStreaming.bind(this.exampleServiceHandler)
                }
            })
            .connect()
            .then(genericClient => new ComponentAClient(
                genericClient,
                new ExampleServiceProxy(genericClient)
            ));
    }
}
