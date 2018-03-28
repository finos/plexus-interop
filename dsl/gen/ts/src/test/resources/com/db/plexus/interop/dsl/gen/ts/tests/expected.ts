import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest, GenericClientApiBase } from "@plexus-interop/client";
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from "@plexus-interop/client";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { Arrays, Observer } from "@plexus-interop/common";
import { InvocationObserver, InvocationObserverConverter, ContainerAwareClientAPIBuilder } from "@plexus-interop/client";

import * as plexus from "./plexus-messages";

/**
 *  Proxy interface of ExampleService service, to be consumed by Client API
 */
export abstract class ExampleServiceProxy {

    public abstract pointToPoint(request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest): Promise<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>;
    
    public abstract serverStreaming(request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest, responseObserver: InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): Promise<InvocationClient>;
    
    public abstract clientToServer(responseObserver: InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): Promise<StreamingInvocationClient<plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest>>;
    
    public abstract bidiStreaming(responseObserver: InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): Promise<StreamingInvocationClient<plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest>>;

}

/**
 *  Internal Proxy implementation for ExampleService service
 */
export class ExampleServiceProxyImpl implements ExampleServiceProxy {

    constructor(private readonly genericClient: GenericClientApi) { }

    public pointToPoint(request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest): Promise<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse> {
        const requestToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "PointToPoint",
            serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
        };
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
    }
    
    public serverStreaming(request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest, responseObserver: InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): Promise<InvocationClient> {
        const requestToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "ServerStreaming",
            serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
        };
        return this.genericClient.sendRawServerStreamingRequest(
            invocationInfo,
            requestToBinaryConverter(request),
            new InvocationObserverConverter<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse, ArrayBuffer>(responseObserver, responseFromBinaryConverter));
    }
    
    public clientToServer(responseObserver: InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): Promise<StreamingInvocationClient<plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest>> {
        const requestToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "ClientToServer",
            serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
        };
        return this.genericClient.sendRawBidirectionalStreamingRequest(
            invocationInfo,
            new InvocationObserverConverter<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse, ArrayBuffer>(responseObserver, responseFromBinaryConverter))
            .then(baseClient =>  {
                return {
                    next: (request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    }
    
    public bidiStreaming(responseObserver: InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): Promise<StreamingInvocationClient<plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest>> {
        const requestToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.encode(from).finish());
        const responseFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.toObject(decoded);
        };
        const invocationInfo: InvocationRequestInfo = {
            methodId: "BidiStreaming",
            serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
        };
        return this.genericClient.sendRawBidirectionalStreamingRequest(
            invocationInfo,
            new InvocationObserverConverter<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse, ArrayBuffer>(responseObserver, responseFromBinaryConverter))
            .then(baseClient =>  {
                return {
                    next: (request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest) => baseClient.next(requestToBinaryConverter(request)),
                    error: baseClient.error.bind(baseClient),
                    complete: baseClient.complete.bind(baseClient),
                    cancel: baseClient.cancel.bind(baseClient)
                };
            });
    }

}

/**
 * Main client API
 *
 */
export interface ComponentAClient extends GenericClientApi  {

    getExampleServiceProxy(): ExampleServiceProxy;

}

/**
 * Client's API internal implementation
 *
 */
class ComponentAClientImpl extends GenericClientApiBase implements ComponentAClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
        private readonly exampleServiceProxy: ExampleServiceProxy
    ) {
        super(genericClient);
    }

    public getExampleServiceProxy(): ExampleServiceProxy {
        return this.exampleServiceProxy;
    }

}

/**
 * Client invocation handler for ExampleService, to be implemented by Client
 *
 */
export abstract class ExampleServiceInvocationHandler {

    public abstract onPointToPoint(invocationContext: MethodInvocationContext, request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest): Promise<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>;

    public abstract onServerStreaming(invocationContext: MethodInvocationContext, request: plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest, hostClient: StreamingInvocationClient<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): void;

    public abstract onClientToServer(invocationContext: MethodInvocationContext, hostClient: StreamingInvocationClient<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest>;

    public abstract onBidiStreaming(invocationContext: MethodInvocationContext, hostClient: StreamingInvocationClient<plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse>): InvocationObserver<plexus.com.db.plexus.interop.dsl.gen.tests.model.IRequest>;

}

/**
 * Internal invocation handler delegate for ExampleService
 *
 */
class ExampleServiceInvocationHandlerInternal {

    public constructor(private readonly clientHandler: ExampleServiceInvocationHandler) {}

    public onPointToPoint(invocationContext: MethodInvocationContext, request: ArrayBuffer): Promise<ArrayBuffer> {
        const responseToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.toObject(decoded);
        };
        return this.clientHandler
            .onPointToPoint(invocationContext, requestFromBinaryConverter(request))
            .then(response => responseToBinaryConverter(response));
    }
    
    public onServerStreaming(invocationContext: MethodInvocationContext, request: ArrayBuffer, hostClient: StreamingInvocationClient<ArrayBuffer>): void {
        const responseToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.toObject(decoded);
        };
        this.clientHandler
            .onServerStreaming(invocationContext, requestFromBinaryConverter(request), {
                next: (response) => hostClient.next(responseToBinaryConverter(response)),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
    }
    
    public onClientToServer(invocationContext: MethodInvocationContext, hostClient: StreamingInvocationClient<ArrayBuffer>): InvocationObserver<ArrayBuffer> {
        const responseToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.toObject(decoded);
        };
        const baseObserver = this.clientHandler
            .onClientToServer(invocationContext, {
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
    }
    
    public onBidiStreaming(invocationContext: MethodInvocationContext, hostClient: StreamingInvocationClient<ArrayBuffer>): InvocationObserver<ArrayBuffer> {
        const responseToBinaryConverter = (from: plexus.com.db.plexus.interop.dsl.gen.tests.model.IResponse) => Arrays.toArrayBuffer(plexus.com.db.plexus.interop.dsl.gen.tests.model.Response.encode(from).finish());
        const requestFromBinaryConverter = (from: ArrayBuffer) => {
            const decoded = plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.decode(new Uint8Array(from));
            return plexus.com.db.plexus.interop.dsl.gen.tests.model.Request.toObject(decoded);
        };
        const baseObserver = this.clientHandler
            .onBidiStreaming(invocationContext, {
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
    }
}

/**
 * Client API builder
 *
 */
export class ComponentAClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: "com.db.plexus.interop.dsl.gen.tests.components.ComponentA"
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    private exampleServiceHandler: ExampleServiceInvocationHandlerInternal;

    public withClientDetails(clientId: ClientConnectRequest): ComponentAClientBuilder {
        this.clientDetails = clientId;
        return this;
    }

    public withAppInstanceId(appInstanceId: UniqueId): ComponentAClientBuilder {
        this.clientDetails.applicationInstanceId = appInstanceId;
        return this;
    }

    public withAppId(appId: string): ComponentAClientBuilder {
        this.clientDetails.applicationId = appId;
        return this;
    }

    public withExampleServiceInvocationsHandler(invocationsHandler: ExampleServiceInvocationHandler): ComponentAClientBuilder {
        this.exampleServiceHandler = new ExampleServiceInvocationHandlerInternal(invocationsHandler);
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): ComponentAClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<ComponentAClient> {
        return new ContainerAwareClientAPIBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .withUnaryInvocationHandler({
                serviceInfo: {
                    serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
                },
                handler: {
                    methodId: "PointToPoint",
                    handle: this.exampleServiceHandler.onPointToPoint.bind(this.exampleServiceHandler)
                }
            })
            .withServerStreamingInvocationHandler({
                serviceInfo: {
                    serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
                },
                handler: {
                    methodId: "ServerStreaming",
                    handle: this.exampleServiceHandler.onServerStreaming.bind(this.exampleServiceHandler)
                }
            })
            .withBidiStreamingInvocationHandler({
                serviceInfo: {
                    serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
                },
                handler: {
                    methodId: "ClientToServer",
                    handle: this.exampleServiceHandler.onClientToServer.bind(this.exampleServiceHandler)
                }
            })
            .withBidiStreamingInvocationHandler({
                serviceInfo: {
                    serviceId: "com.db.plexus.interop.dsl.gen.tests.services.ExampleService"
                },
                handler: {
                    methodId: "BidiStreaming",
                    handle: this.exampleServiceHandler.onBidiStreaming.bind(this.exampleServiceHandler)
                }
            })
            .connect()
            .then(genericClient => new ComponentAClientImpl(
                genericClient,
                new ExampleServiceProxyImpl(genericClient)
                ));
    }
}
