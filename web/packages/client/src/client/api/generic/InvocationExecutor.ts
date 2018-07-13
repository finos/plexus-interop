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
import { Invocation } from '../../../client/generic/Invocation';
import { Logger, LoggerFactory, AnonymousSubscription } from '@plexus-interop/common';
import { StreamingInvocationHost } from './handlers/streaming/StreamingInvocationHost';
import { InvocationHandlersRegistry } from './handlers/InvocationHandlersRegistry';
import { BaseInvocation } from '../../generic/BaseInvocation';
import { UniqueId } from '@plexus-interop/transport-common';
import { ActionReference } from '@plexus-interop/client-api';
import { SuccessCompletion, ClientProtocolHelper, ErrorCompletion } from '@plexus-interop/protocol';

export class InvocationExecutor {

    private log: Logger = LoggerFactory.getLogger('InvocationExecutor');

    constructor(private readonly handlersRegistry: InvocationHandlersRegistry) { }

    public handleGenericInvocation(invocation: Invocation): void {
        this.log.trace(`Received invocation`);
        new StreamingInvocationHost(this.handlersRegistry).executeGenericHandler(invocation);
    }

    public handleInvocation(invocation: BaseInvocation<any, any>): void {
        this.log.trace(`Received invocation`);
        new StreamingInvocationHost(this.handlersRegistry).executeTypeAwareHandler(invocation);
    }

    public invokeRawUnaryHandler(consumerAppId: string, actionReference: ActionReference, requestPayloadBuffer: ArrayBuffer): Promise<ArrayBuffer> {
        return this.internalInvokeUnaryHandler(consumerAppId, actionReference, requestPayloadBuffer, false);
    }
    public invokeUnaryHandler(consumerAppId: string, actionReference: ActionReference, requestPayload: any): Promise<any> {
        return this.internalInvokeUnaryHandler(consumerAppId, actionReference, requestPayload, true);
    }

    public internalInvokeUnaryHandler(consumerAppId: string, actionReference: ActionReference, requestPayload: any, isTyped: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const invocation: BaseInvocation<any, any> = {
                uuid: () => UniqueId.generateNew(),
                sendMessage: async response => resolve(response),
                open: observer => {
                    observer.started(new AnonymousSubscription());
                    observer.next(requestPayload);
                    observer.streamCompleted();
                    observer.complete();
                },
                getMetaInfo: () => {
                    return {
                        ...actionReference,
                        consumerApplicationId: consumerAppId
                    };
                },
                close: async completion => {
                    if (!ClientProtocolHelper.isSuccessCompletion(completion || new SuccessCompletion())) {
                        reject(completion);
                        return new ErrorCompletion();
                    } else {
                        return new SuccessCompletion();
                    }
                }
            };
            isTyped ? this.handleInvocation(invocation) : this.handleGenericInvocation(invocation);
        });
    }

}