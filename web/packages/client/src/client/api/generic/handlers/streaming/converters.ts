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
import { InvocationHandlerConverter } from '../InvocationHandlerConverter';
import { ServerStreamingInvocationHandler } from './ServerStreamingInvocationHandler';
import { BidiStreamingInvocationHandler } from './BidiStreamingInvocationHandler';
import { StreamingInvocationClient } from './StreamingInvocationClient';
import { ClientDtoUtils } from '../../../../ClientDtoUtils';
import { Logger, LoggerFactory, Arrays } from '@plexus-interop/common';
import { MethodInvocationContext } from '@plexus-interop/client-api';
import { BinaryMarshallerProvider } from '@plexus-interop/io';

export class ServerStreamingConverter<Req, Res> implements InvocationHandlerConverter<ServerStreamingInvocationHandler<Req, Res>, Req, Res> {

    public constructor(private readonly log: Logger = LoggerFactory.getLogger('ServerStreamingConverter')) { }

    public convert(baseHandler: ServerStreamingInvocationHandler<Req, Res>): BidiStreamingInvocationHandler<Req, Res> {
        return {
            serviceInfo: baseHandler.serviceInfo,
            methodId: baseHandler.methodId,
            handle: (invocationContext: MethodInvocationContext, invocationHostClient: StreamingInvocationClient<Res>) => {
                return {
                    next: (request) => {
                        try {
                            baseHandler.handle(invocationContext, request, invocationHostClient);
                        } catch (executionError) {
                            this.log.error('Execution error', executionError);
                            invocationHostClient.error(ClientDtoUtils.toError(executionError));
                        }
                    },
                    streamCompleted: () => this.log.debug('Messages stream completed'),
                    error: e => this.log.error('Error received', e),
                    complete: () => this.log.debug('Invocation completed')
                };
            }
        };
    }
}

export function toGenericStreamingHandler(
    typedHandler: ServerStreamingInvocationHandler<any, any>,
    requestType: any,
    responseType: any,
    marshallerProvider: BinaryMarshallerProvider): ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> {

    const requestMarshaller = marshallerProvider.getMarshaller(requestType);
    const responseMarshaller = marshallerProvider.getMarshaller(responseType);

    return {
        ...typedHandler,
        handle: (invocationContext: MethodInvocationContext, requestPayload: ArrayBuffer, hostClient: StreamingInvocationClient<ArrayBuffer>) => {
            const typedPayload = requestMarshaller.decode(new Uint8Array(requestPayload));
            typedHandler.handle(invocationContext, typedPayload, {
                next: response => hostClient.next(Arrays.toArrayBuffer(responseMarshaller.encode(response))),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
        }
    };

}

export function toGenericBidiStreamingHandler(
    typedHandler: BidiStreamingInvocationHandler<any, any>,
    requestType: any,
    responseType: any,
    marshallerProvider: BinaryMarshallerProvider): BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer> {
    const requestMarshaller = marshallerProvider.getMarshaller(requestType);
    const responseMarshaller = marshallerProvider.getMarshaller(responseType);
    return {
        ...typedHandler,
        handle: (invocationContext: MethodInvocationContext, hostClient: StreamingInvocationClient<ArrayBuffer>) => {
            const baseObserver = typedHandler.handle(invocationContext, {
                next: typedResponse => hostClient.next(Arrays.toArrayBuffer(responseMarshaller.encode(typedResponse))),
                complete: hostClient.complete.bind(hostClient),
                error: hostClient.error.bind(hostClient),
                cancel: hostClient.cancel.bind(hostClient)
            });
            return {
                next: (requestPayload: ArrayBuffer) => baseObserver.next(requestMarshaller.decode(new Uint8Array(requestPayload))),
                complete: baseObserver.complete.bind(baseObserver),
                error: baseObserver.error.bind(baseObserver),
                streamCompleted: baseObserver.streamCompleted.bind(baseObserver)
            };
        }
    };
}