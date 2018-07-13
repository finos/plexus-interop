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
import { GenericClient } from '../../../client/generic/GenericClient';
import { Invocation } from '../../../client/generic/Invocation';
import { Logger, LoggerFactory } from '@plexus-interop/common';
import { StreamingInvocationHost } from './handlers/streaming/StreamingInvocationHost';
import { InvocationHandlersRegistry } from './handlers/InvocationHandlersRegistry';

export class GenericInvocationsHost {

    private log: Logger = LoggerFactory.getLogger('GenericInvocationHost');

    constructor(
        private readonly genericClient: GenericClient,
        private readonly handlersRegistry: InvocationHandlersRegistry
    ) {
    }

    public start(): Promise<void> {
        return this.genericClient.acceptInvocations({
            next: (invocation: Invocation) => this.handleInvocation(invocation),
            error: (e) => this.log.error('Error on invocations subscription', e),
            complete: () => this.log.debug('Invocations subscription completed')
        })
            .then(() => this.log.debug('Started to listen invocations'))
            .catch((e) => {
                this.log.error('Error on opening invocations subscription', e);
                throw e;
            });
    }

    private handleInvocation(invocation: Invocation): void {
        this.log.trace(`Received invocation`);
        new StreamingInvocationHost(this.handlersRegistry, invocation).executeGenericHandler();
    }

}