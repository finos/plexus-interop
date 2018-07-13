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
import { Invocation } from '../../../../../client/generic/Invocation';
import { StreamingInvocationClientImpl } from './StreamingInvocationClientImpl';
import { Logger, Observer, LoggerFactory, CancellationToken } from '@plexus-interop/common';
import { ClientDtoUtils } from '../../../../ClientDtoUtils';
import { MethodInvocationContext, ActionReference } from '@plexus-interop/client-api';
import { UniqueId } from '@plexus-interop/transport-common';
import { InvocationObserver } from '../../../../generic/InvocationObserver';
import { InvocationHandlersRegistry } from '../InvocationHandlersRegistry';

export class StreamingInvocationHost {

    private logger: Logger = LoggerFactory.getLogger('StreamingInvocationHost');

    public constructor(
        private readonly handlersRegistry: InvocationHandlersRegistry,
        private readonly invocation: Invocation) { }

    public executeTypeAwareHandler(): void {
        this.execute(true);
    }

    public executeGenericHandler(): void {
        this.execute(false);
    }

    private execute(isTypeAware: boolean): void {

        this.logger.debug('Handling invocation started');
        let baseRequestObserver: null | Observer<any> = null;
        const invocationCancellationToken = new CancellationToken();
        this.invocation.open({

            started: (s) => {
                this.logger.trace('Invocation opened');
                const metaInfo = this.invocation.getMetaInfo();
                const actionRef: ActionReference = {
                    serviceAlias: metaInfo.serviceAlias,
                    methodId: metaInfo.methodId as string,
                    serviceId: metaInfo.serviceId as string
                };
                const hash = ClientDtoUtils.targetInvocationHash(metaInfo);
                this.logger = LoggerFactory.getLogger(`Invocation Host [${hash}]`);
                const invocationHandler = isTypeAware ? this.handlersRegistry.getTypeAwareBidiStreamingHandler(actionRef) : this.handlersRegistry.getRawBidiStreamingHandler(actionRef);
                if (invocationHandler) {
                    const invocationContext = new MethodInvocationContext(metaInfo.consumerApplicationId as string, metaInfo.consumerConnectionId as UniqueId, invocationCancellationToken);
                    baseRequestObserver = invocationHandler.handle(invocationContext, new StreamingInvocationClientImpl(this.invocation, this.logger));
                } else {
                    this.logger.error(`No handler found for hash [${hash}]`);
                }
            },

            startFailed: (e) => this.logger.error('Could not open invocation', e),

            next: (requestPayload: any) => {
                if (!isTypeAware) {
                    this.logger.trace(`Received message of ${requestPayload.byteLength} bytes`);
                } else {
                    this.logger.trace(`Received message object`);
                }
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as Observer<any>).next(requestPayload));
            },

            complete: () => {
                this.logger.trace('Received remote completion');
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as Observer<any>).complete());
            },

            streamCompleted: () => {
                this.logger.trace('Received remote stream completion');
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as InvocationObserver<any>).streamCompleted());
            },

            error: invocationError => {
                this.logger.error(`Received invocation error, passing to client`, invocationError);
                invocationCancellationToken.cancel('Invocation error received');
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as Observer<any>).error(invocationError));
            }
        });
    }

    private handleClientAction(nullableClient: any, func: Function): void {
        if (nullableClient === null) {
            this.logger.error('Client is not initialized');
        } else {
            try {
                func();
            } catch (error) {
                this.logger.error('Internal client\'s execution error', error);
            }
        }
    }

}