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
import { BidiStreamingInvocationHandler } from './BidiStreamingInvocationHandler';
import { Invocation } from '../../../client/generic/Invocation';
import { StreamingInvocationClientImpl } from './StreamingInvocationClientImpl';
import { Logger, Observer, LoggerFactory, CancellationToken } from '@plexus-interop/common';
import { ClientDtoUtils } from '../../ClientDtoUtils';
import { MethodInvocationContext } from '@plexus-interop/client-api';
import { UniqueId } from '@plexus-interop/transport-common';
import { InvocationObserver } from '../../generic/InvocationObserver';

export class StreamingInvocationHost {

    private logger: Logger = LoggerFactory.getLogger('StreamingInvocationHost');

    public constructor(
        private readonly handlersRegistry: Map<String, BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>>,
        private readonly invocation: Invocation) { }

    public execute(): void {

        this.logger.debug('Handling invocation started');
        let baseRequestObserver: null | Observer<ArrayBuffer> = null;
        const invocationCancellationToken = new CancellationToken();
        this.invocation.open({

            started: (s) => {
                this.logger.trace('Invocation opened');
                const metaInfo = this.invocation.getMetaInfo();
                const hash = ClientDtoUtils.targetInvocationHash(metaInfo);
                this.logger = LoggerFactory.getLogger(`Invocation Host [${hash}]`);
                const invocationHandler = this.handlersRegistry.get(hash);
                if (invocationHandler) {
                    const invocationContext = new MethodInvocationContext(metaInfo.consumerApplicationId as string, metaInfo.consumerConnectionId as UniqueId, invocationCancellationToken);
                    baseRequestObserver = invocationHandler.handle(invocationContext, new StreamingInvocationClientImpl(this.invocation, this.logger));
                } else {
                    this.logger.error(`No handler found for hash [${hash}]`);
                }
            },

            startFailed: (e) => this.logger.error('Could not open invocation', e),

            next: (requestPayload: ArrayBuffer) => {
                this.logger.trace(`Received message of ${requestPayload.byteLength} bytes`);
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as Observer<ArrayBuffer>).next(requestPayload));
            },

            complete: () => {
                this.logger.trace('Received remote completion');
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as Observer<ArrayBuffer>).complete());
            },

            streamCompleted: () => {
                this.logger.trace('Received remote stream completion');
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as InvocationObserver<ArrayBuffer>).streamCompleted());
            },

            error: invocationError => {
                this.logger.error(`Received invocation error, passing to client`, invocationError);
                invocationCancellationToken.cancel('Invocation error received');
                this.handleClientAction(baseRequestObserver, () => (baseRequestObserver as Observer<ArrayBuffer>).error(invocationError));
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