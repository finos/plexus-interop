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
import { AcceptedInvocation } from "../../src/client/generic/AcceptedInvocation";
import { Invocation } from "../../src/client/generic/Invocation";
import { createInvocationInfo } from "./client-mocks";
import { GenericInvocationsHost } from "../../src/client/api/generic/GenericInvocationsHost";
import { StreamingInvocationClient } from "../../src/client/api/streaming/StreamingInvocationClient";
import { UnaryHandlerConverter } from "../../src/client/api/unary/UnaryHandlerConverter";
import { ServerStreamingInvocationHandler } from "../../src/client/api/streaming/ServerStreamingInvocationHandler";
import { ServerStreamingConverter } from "../../src/client/api/streaming/ServerStreamingHandlerConveter";
import { ServiceInfo } from "@plexus-interop/client-api";
import { LogObserver } from "../LogObserver";

import { when, mock, instance, anything, verify, capture } from "ts-mockito";
import { GenericClientImpl } from "../../src/client/generic/GenericClientImpl";
import { Observer } from "@plexus-interop/common";
import { clientProtocol as plexus, SuccessCompletion } from "@plexus-interop/protocol"
import { Subscription, AnonymousSubscription } from "rxjs/Subscription";
import { ChannelObserver } from "@plexus-interop/transport-common";
import { MethodInvocationContext } from "@plexus-interop/client-api";

declare var process: any;

process.on("unhandledRejection", (reason: any, p: any) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

describe("GenericInvocationHost", () => {

    it("It registers handlers of all types", () => {

        const serviceInfo: ServiceInfo = {
            serviceId: "sid"
        };

        const genericInvocationsHost = new GenericInvocationsHost(
            "appId",
            instance(mock(GenericClientImpl)),
            // bidi streaming
            [
                {
                    serviceInfo,
                    handler: {
                        methodId: "1",
                        handle: (context: MethodInvocationContext, invocationHostClient: StreamingInvocationClient<ArrayBuffer>) => {
                            return new LogObserver<ArrayBuffer>();
                        }
                    }
                }
            ], 
            // unary
            [
                {
                    serviceInfo,
                    handler: {
                        methodId: "2",
                        handle: (context: MethodInvocationContext, req: ArrayBuffer) => {
                            return Promise.resolve<ArrayBuffer>(new Uint8Array([]).buffer);
                        }
                    }
                }
            ], 
            // server streaming
            [
                {
                    serviceInfo,
                    handler: {
                        methodId: "3",
                        handle: (context: MethodInvocationContext, requestPayload: ArrayBuffer, invocationHostClient: StreamingInvocationClient<ArrayBuffer>) => {
                        }
                    }
                }
            ]
        );
        expect(genericInvocationsHost.handlersRegistry.size).toBe(3);

    });

    it("Can handle invocoming invocation and send response back", async (done) => {

        const responsePayload = new Uint8Array([1, 2, 3]).buffer;
        const requestPayload = new Uint8Array([3, 2, 1]).buffer;

        setupSimpleHostedInvocation(requestPayload, async (completion: plexus.ICompletion) => {
            done();
            return new SuccessCompletion();
        }, async (context: MethodInvocationContext, request: ArrayBuffer) => {
            console.log("Doing important stuff ...");
            return responsePayload;
        }, (invocation) => {
            verify(invocation.sendMessage(responsePayload)).called();
        });

    });

    it("Closes invocation with error on if execution rejected", async (done) => {

        const requestPayload = new Uint8Array([3, 2, 1]).buffer;

        setupSimpleHostedInvocation(requestPayload, async (completion: plexus.ICompletion) => {
            expect(completion).toBeDefined();
            expect(completion.status).toEqual(plexus.Completion.Status.Failed);
            expect(completion.error).toBeDefined();
            done();
            return new SuccessCompletion();
        }, (context: MethodInvocationContext, request: ArrayBuffer) => Promise.reject("Execution error"));

    });

    it("Closes invocation with error on if execution failed", async (done) => {

        const requestPayload = new Uint8Array([3, 2, 1]).buffer;

        setupSimpleHostedInvocation(requestPayload, async (completion: plexus.ICompletion) => {
            expect(completion).toBeDefined();
            expect(completion.status).toEqual(plexus.Completion.Status.Failed);
            expect(completion.error).toBeDefined();
            done();
            return new SuccessCompletion();
        }, (context: MethodInvocationContext, request: ArrayBuffer) => { throw new Error("Execution error"); });

    });

    it("Can receive multiple messages, send multiple responses back and complete invocation", async (done) => {
        const requestPayload = new Uint8Array([3, 2, 1]).buffer;
        const responsePayload = new Uint8Array([1, 2, 3]).buffer;
        setupHostedInvocation(requestPayload, async (completion: plexus.ICompletion) => {
            done();
            return new SuccessCompletion();
        }, (context: MethodInvocationContext, client) => {
            let count = 0;
            return {
                next: (request) => {
                    expect(request).toBe(requestPayload);
                    count++;
                    client.next(responsePayload);
                    if (count === 3) {
                        client.complete();
                    }
                },
                error: (e) => { },
                complete: () => { }
            };
        }, (invocation) => {
        }, 3);
    });

    it("Can send multiple responses back and complete invocation with Server Streaming handler", (done) => {

        const requestPayload = new Uint8Array([3, 2, 1]).buffer;
        const responsePayload = new Uint8Array([1, 2, 3]).buffer;

        const streamingHandler: ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> = {
            methodId: "",
            handle: (context: MethodInvocationContext, receivedRequest: ArrayBuffer, invocationHostClient: StreamingInvocationClient<ArrayBuffer>) => {
                expect(receivedRequest).toBe(requestPayload);
                invocationHostClient.next(responsePayload);
                invocationHostClient.next(responsePayload);
                invocationHostClient.complete();
            }
        };

        setupServerStreamingHostedInvocation(
            
            requestPayload, 
            
            (completion: plexus.ICompletion) => Promise.resolve(new SuccessCompletion()), 
            
            streamingHandler, 
            
            (invocation: Invocation) => {
                verify(invocation.sendMessage(responsePayload)).twice();
                verify(invocation.close(anything())).called();
                done();                
            });
    });

});

function setupSimpleHostedInvocation(
    requestPayload: ArrayBuffer,
    invocationCloseHandler: (x: plexus.ICompletion) => Promise<plexus.ICompletion>,
    hostedAction: (context: MethodInvocationContext, request: ArrayBuffer) => Promise<ArrayBuffer>,
    postHandler?: (invocation: Invocation) => void): void {

    const streamingHandler = new UnaryHandlerConverter().convert({
        methodId: "",
        handle: hostedAction
    });

    setupHostedInvocation(requestPayload, invocationCloseHandler, streamingHandler.handle, postHandler);
}

function setupServerStreamingHostedInvocation(
    requestPayload: ArrayBuffer,
    invocationCloseHandler: (x: plexus.ICompletion) => Promise<plexus.ICompletion>,
    serverStreamingHandler: ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>,
    postHandler?: (invocation: Invocation) => void): void {

    const streamingHandler = new ServerStreamingConverter().convert(serverStreamingHandler);

    setupHostedInvocation(requestPayload, invocationCloseHandler, streamingHandler.handle, postHandler);
}

function setupHostedInvocation(
    requestPayload: ArrayBuffer,
    invocationCloseHandler: (x: plexus.ICompletion) => Promise<plexus.ICompletion>,
    hostedAction: (context: MethodInvocationContext, invocationHostClient: StreamingInvocationClient<ArrayBuffer>) => Observer<ArrayBuffer>,
    postHandler?: (invocation: Invocation) => void,
    requestMessagesCount: number = 1): void {

    const invocationInfo = createInvocationInfo();
    const mockInvocation = mock(AcceptedInvocation);

    when(mockInvocation.getMetaInfo()).thenReturn(invocationInfo);
    when(mockInvocation.sendMessage(anything())).thenReturn(Promise.resolve());
    when(mockInvocation.close(anything())).thenCall((completion: plexus.ICompletion) => {
        if (postHandler) {
            postHandler(mockInvocation);
        }
        invocationCloseHandler(completion);
        return Promise.resolve(new SuccessCompletion());
    });
    
    let requestObserver = null;
    when(mockInvocation.open(anything())).thenCall((observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>) => {
        setTimeout(() => {
            observer.started(new Subscription());
            setTimeout(() => {
                requestObserver = observer;
                for (let i = 0; i < requestMessagesCount; i++) {
                    observer.next(requestPayload);
                }
                observer.complete();
            }, 0);
        }, 0);
    });

    const mockInvocationInstance = instance(mockInvocation);

    const mockGenericClient = mock(GenericClientImpl);
    when(mockGenericClient.acceptInvocations(anything())).thenCall((observer: Observer<Invocation>) => {
        setTimeout(() => {
            observer.next(mockInvocationInstance);
            observer.complete();
        }, 0);
        return Promise.resolve();
    });
    const mockGenericClientInstance = instance(mockGenericClient);
    const invocationHost = new GenericInvocationsHost(invocationInfo.applicationId as string, mockGenericClientInstance, [
        {
            serviceInfo: {
                serviceId: invocationInfo.serviceId as string
            },
            handler: {
                methodId: invocationInfo.methodId as string,
                handle: hostedAction
            }
        }
    ]);

    invocationHost.start();
}