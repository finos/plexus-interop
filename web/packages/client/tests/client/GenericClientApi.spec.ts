/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import { when, mock, instance, anything, verify, capture } from 'ts-mockito';
import { GenericClientApiImpl } from '../../src/client/api/generic/GenericClientApiImpl';
import { GenericClientImpl } from '../../src/client/generic/GenericClientImpl';
import { RequestedInvocation } from '../../src/client/generic/RequestedInvocation';
import { Observer } from '@plexus-interop/common';
import { createRemoteInvocationInfo, MockMarshallerProvider } from './client-mocks';
import { clientProtocol as plexus, Completion, ErrorCompletion, SuccessCompletion } from '@plexus-interop/protocol';
import { Subscription, AnonymousSubscription } from 'rxjs/Subscription';
import { ChannelObserver } from '@plexus-interop/transport-common';

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

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());
        await clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => {
                expect(v).toEqual(responsePayload);
                done();
            },
            error: () => { }
        });

    });

    it('Fails Point to Point invocation if invalid completion received', (done) => {

        const mockInvocation = mock(RequestedInvocation);

        const responsePayload = new Uint8Array([3, 2, 1]).buffer;
        const requestPayload = new Uint8Array([1, 2, 3]).buffer;

        when(mockInvocation.open(anything())).thenCall((observer: ChannelObserver<AnonymousSubscription, ArrayBuffer>) => {
            observer.started(new Subscription());
            observer.next(responsePayload);
            observer.complete();
        });

        when(mockInvocation.sendMessage(anything())).thenReturn(Promise.resolve());
        when(mockInvocation.close(anything())).thenReturn(Promise.resolve(new ErrorCompletion()));

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything()))
            .thenReturn(Promise.resolve(instance(mockInvocation)));

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());

        clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => { },
            error: () => done()
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

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());

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

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());
        clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => { },
            error: () => { }
        }).catch(() => done());

    });

    it('Fails Point to Point invocation if request invocation failed', (done) => {

        const mockGenericClient = mock(GenericClientImpl);
        when(mockGenericClient.requestInvocation(anything())).thenReturn(Promise.reject('Error'));

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());
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

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());
        const invocationClient = await clientApi.sendRawUnaryRequest(createRemoteInvocationInfo(), requestPayload, {
            value: (v) => {
                fail('Not expected');
            },
            error: () => {
                fail('Not expected');
            }
        });

        await invocationClient.cancel();
        verify(mockInvocation.close(anything())).twice();
        const [completion] = capture(mockInvocation.close).last();
        expect((completion as Completion).status).toBe(plexus.Completion.Status.Canceled);

    });

    it('It can send few messages and complete invocation by Streaming client', async () => {

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

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());
        const streamingInvocationClient = await clientApi.sendRawBidirectionalStreamingRequest(createRemoteInvocationInfo(), {
            next: (v) => {
                fail('Not expected');
            },
            complete: () => { },
            error: () => { },
            streamCompleted: () => {}
        });

        await streamingInvocationClient.next(first);
        await streamingInvocationClient.next(second);
        await streamingInvocationClient.complete();

        verify(mockInvocation.close(anything())).once();
        verify(mockInvocation.sendMessage(anything())).twice();
        verify(mockInvocation.sendMessage(first)).once();
        verify(mockInvocation.sendMessage(second)).once();

    });

    it('It can receive message, completion and complete invocation with Streaming client', async (done) => {

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

        const clientApi = new GenericClientApiImpl(instance(mockGenericClient), new MockMarshallerProvider());
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
            streamCompleted: () => {}
        });
        
    });

});