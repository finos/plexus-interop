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
import { when, mock, instance, anything, verify, capture } from 'ts-mockito';
import { GenericClientApiImpl } from '../../src/client/api/generic/GenericClientApiImpl';
import { GenericClientImpl } from '../../src/client/generic/GenericClientImpl';
import { RequestedInvocation } from '../../src/client/generic/RequestedInvocation';
import { Observer } from '@plexus-interop/common';
import { createRemoteInvocationInfo, MockMarshallerProvider } from './client-mocks';
import { clientProtocol as plexus, Completion, SuccessCompletion } from '@plexus-interop/protocol';
import { Subscription, AnonymousSubscription } from 'rxjs/Subscription';
import { ChannelObserver } from '@plexus-interop/transport-common';
import { InvocationHandlersRegistry} from '../../src';
import { Arrays } from '@plexus-interop/common';
import { MethodInvocationContext } from '@plexus-interop/client-api';

describe('GenericClientApi', () => {

    it('Can send point to point invocation and receive result', async (done) => {
        const mockInvocation = mock(RequestedInvocation);

        const responsePayload = new Uint8Array([3, 2, 1]).buffer;
        const requestPayload = new Uint8Array([1, 2, 3]).buffer;

        when(mockInvocation.open(anything())).thenCall((observer: Observer<ArrayBuffer>) => {
            observer.next(responsePayload);
            observer.complete();
        });

        when(mockInvocation.sendMessage(anything())).thenReturn(Promise.resolve());
        when(mockInvocation.close(anything())).thenReturn(Promise.resolve(new SuccessCompletion()));

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything()))
            .thenReturn(Promise.resolve(instance(mockInvocation)));

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);

        await clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => {
                expect(v).toEqual(responsePayload);
                done();
            },
            error: () => { }
        });

    });

    it('Fails Point to Point invocation if completed without message', (done) => {

        const mockInvocation = mock(RequestedInvocation);

        const requestPayload = new Uint8Array([1, 2, 3]).buffer;

        when(mockInvocation.open(anything())).thenCall((observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>) => {
            observer.started(new Subscription());
            observer.complete();
        });

        when(mockInvocation.sendMessage(anything())).thenReturn(Promise.resolve());
        when(mockInvocation.close(anything())).thenReturn(Promise.resolve(new SuccessCompletion()));

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything()))
            .thenReturn(Promise.resolve(instance(mockInvocation)));

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);

        clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => { },
            error: () => done()
        });

    });

    it('Fails Point to Point invocation if send message failed', (done) => {

        const mockInvocation = mock(RequestedInvocation);

        const requestPayload = new Uint8Array([1, 2, 3]).buffer;

        when(mockInvocation.open(anything())).thenCall((observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>) => {
            observer.started(new Subscription());
            observer.complete();
        });

        when(mockInvocation.sendMessage(anything())).thenReturn(Promise.reject('Error'));

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything()))
            .thenReturn(Promise.resolve(instance(mockInvocation)));

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);
        clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => { },
            error: () => { }
        }).catch(() => done());

    });

    it('Fails Point to Point invocation if request invocation failed', (done) => {

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything())).thenReturn(Promise.reject('Error'));

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);
        const requestPayload = new Uint8Array([1, 2, 3]).buffer;

        clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => { },
            error: () => { }
        }).catch(() => done());

    });

    it('Allows to cancel invocation by client', async () => {

        const mockInvocation = mock(RequestedInvocation);

        const requestPayload = new Uint8Array([1, 2, 3]).buffer;

        when(mockInvocation.open(anything())).thenCall((observer) => observer.started(new Subscription()));

        when(mockInvocation.sendMessage(anything())).thenReturn(Promise.resolve());
        when(mockInvocation.close(anything())).thenReturn(Promise.resolve(new SuccessCompletion()));

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything()))
            .thenReturn(Promise.resolve(instance(mockInvocation)));

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);
        const invocationClient = await clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => {
                fail('Not expected');
            },
            error: () => {
                fail('Not expected');
            }
        });

        await invocationClient.cancel();
        verify(mockInvocation.close(anything())).called();
        const [completion] = capture(mockInvocation.close).last();
        expect((completion as Completion).status).toBe(plexus.Completion.Status.Canceled);

    });

    it('Can send few messages and complete invocation by Streaming client', async () => {

        const mockInvocation = mock(RequestedInvocation);

        const first = new Uint8Array([3, 2, 1]).buffer;
        const second = new Uint8Array([1, 2, 3]).buffer;

        when(mockInvocation.open(anything())).thenCall((observer) => observer.started(new Subscription()));

        when(mockInvocation.sendMessage(anything())).thenReturn(Promise.resolve());
        when(mockInvocation.sendMessage(anything())).thenReturn(Promise.resolve());
        when(mockInvocation.close(anything())).thenReturn(Promise.resolve(new SuccessCompletion()));

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything()))
            .thenReturn(Promise.resolve(instance(mockInvocation)));

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);
        const streamingInvocationClient = await clientApi.sendRawBidirectionalStreamingRequest(createRemoteInvocationInfo(), {
            next: (v) => {
                fail('Not expected');
            },
            complete: () => { },
            error: () => { },
            streamCompleted: () => { }
        });

        await streamingInvocationClient.next(first);
        await streamingInvocationClient.next(second);
        await streamingInvocationClient.complete();

        verify(mockInvocation.close(anything())).once();
        verify(mockInvocation.sendMessage(anything())).twice();
        verify(mockInvocation.sendMessage(first)).once();
        verify(mockInvocation.sendMessage(second)).once();

    });

    it('Can invoke own registered handler', async () => {

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);

        const serviceInfo = {
            serviceId: 'service'
        };
        const methodId = 'method';
        const requestPayload = 'test';

        registry.registerUnaryHandler({
            serviceInfo,
            methodId,
            handle: async (context, request) => {
                expect(request).toBe(requestPayload);
                return request;
            }
        }, {}, {});

        const mockGenericClient = mock(GenericClientImpl);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);

        const response = await clientApi.invokeUnaryHandler(new MethodInvocationContext('app'), { serviceId: serviceInfo.serviceId, methodId }, requestPayload);
        
        expect(response).toBe(requestPayload);
        
    });

    it('Can invoke own registered generic handler', async () => {

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);

        const serviceInfo = {
            serviceId: 'service'
        };
        const methodId = 'method';
        const requestPayload = Arrays.toArrayBuffer(new Uint8Array([123]));

        registry.registerUnaryGenericHandler({
            serviceInfo,
            methodId,
            handle: async (context, request) => {
                expect(new Uint8Array(request)).toEqual(new Uint8Array(requestPayload));
                return request;
            }
        });

        const mockGenericClient = mock(GenericClientImpl);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);

        const response = await clientApi.invokeRawUnaryHandler(new MethodInvocationContext('app'), { serviceId: serviceInfo.serviceId, methodId }, requestPayload);
        expect(new Uint8Array(response)).toEqual(new Uint8Array(requestPayload));

    });

    it('Can receive message, completion and complete invocation with Streaming client', async (done) => {

        const mockInvocation = mock(RequestedInvocation);

        const responsePayload = new Uint8Array([3, 2, 1]).buffer;
        when(mockInvocation.open(anything())).thenCall((observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>) => {
            setTimeout(() => {
                observer.started(new Subscription());
                setTimeout(() => {
                    observer.next(responsePayload);
                    observer.next(responsePayload);
                    observer.complete();
                }, 0);
            }, 0);
        });

        when(mockInvocation.close(anything())).thenReturn(Promise.resolve(new SuccessCompletion()));

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything()))
            .thenReturn(Promise.resolve(instance(mockInvocation)));

        const mockMarshaller = new MockMarshallerProvider();
        const registry = new InvocationHandlersRegistry(mockMarshaller);
        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), mockMarshaller, registry);
        let count = 0;
        const streamingInvocationClient = await clientApi.sendRawBidirectionalStreamingRequest(createRemoteInvocationInfo(), {
            next: (v) => {
                expect(v).toBe(responsePayload);
                count++;
            },
            complete: () => {
                streamingInvocationClient.complete().then(() => {
                    expect(count).toBe(2);
                    verify(mockInvocation.close(anything())).once();
                    done();
                }, (e) => {
                    fail('Error not expected');
                });
            },
            error: () => fail('Not expected'),
            streamCompleted: () => { }
        });

    });

});