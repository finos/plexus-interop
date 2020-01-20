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
import { BinaryMarshallerProvider } from '@plexus-interop/io';
import { Arrays } from '@plexus-interop/common';
import { UnaryInvocationHandler } from './UnaryInvocationHandler';
import { BidiStreamingInvocationHandler } from '../streaming/BidiStreamingInvocationHandler';
import { StreamingInvocationClient } from '../streaming/StreamingInvocationClient';
import { InvocationHandlerConverter } from '../InvocationHandlerConverter';
import { Logger, LoggerFactory } from '@plexus-interop/common';
import { MethodInvocationContext } from '@plexus-interop/client-api';
import { ClientDtoUtils } from '../../../../ClientDtoUtils';

export function toGenericUnaryHandler(
    handler: UnaryInvocationHandler<any, any>,
    requestType: any,
    responseType: any,
    marshallerProvider: BinaryMarshallerProvider): UnaryInvocationHandler<ArrayBuffer, ArrayBuffer> {

    const requestMarshaller = marshallerProvider.getMarshaller(requestType);
    const responseMarshaller = marshallerProvider.getMarshaller(responseType);

    return {
        ...handler,
        handle: async (invocationContext, request: ArrayBuffer) => {
            const payload = requestMarshaller.decode(new Uint8Array(request));
            const rawResponse = await handler.handle(invocationContext, payload);
            return Arrays.toArrayBuffer(responseMarshaller.encode(rawResponse));
        }
    };

}

export class UnaryHandlerConverter<Req, Res> implements InvocationHandlerConverter<UnaryInvocationHandler<Req, Res>, Req, Res> {

    public constructor(private readonly log: Logger = LoggerFactory.getLogger('UnaryHandlerConverter')) { }

    public convert(unary: UnaryInvocationHandler<Req, Res>): BidiStreamingInvocationHandler<Req, Res> {
        return {
            serviceInfo: unary.serviceInfo,
            methodId: unary.methodId,
            handle: (invocationContext: MethodInvocationContext, invocationHostClient: StreamingInvocationClient<Res>) => {
                return {
                    next: (request: Req) => {
                        try {
                            unary.handle(invocationContext, request).then(async (response) => {
                                try {
                                    await invocationHostClient.next(response);
                                    await invocationHostClient.complete();
                                } catch (error) {
                                    this.log.error('Unable to send response', error);
                                }
                            }).catch((error) => {
                                this.log.error('Execution error', error);
                                invocationHostClient.error(ClientDtoUtils.toError(error));
                            });
                        } catch (executionError) {
                            this.log.error('Execution error', executionError);
                            invocationHostClient.error(ClientDtoUtils.toError(executionError));
                        }
                    },
                    streamCompleted: () => this.log.debug('Stream completed'),
                    error: e => this.log.error('Error received', e),
                    complete: () => this.log.debug('Invocation completed')
                };
            }
        };
    }

}