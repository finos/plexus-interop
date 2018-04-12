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
import { EchoServiceInvocationHandler } from '../../src/echo/server/EchoServerGeneratedClient';
import { StreamingInvocationClient, MethodInvocationContext, InvocationObserver } from '@plexus-interop/client';
import { Observer } from '@plexus-interop/common';

import * as plexus from '../../src/echo/gen/plexus-messages';

export class NopServiceHandler implements EchoServiceInvocationHandler {

    public onUnary(context: MethodInvocationContext, request: plexus.plexus.interop.testing.IEchoRequest): Promise<plexus.plexus.interop.testing.IEchoRequest> {
        throw new Error('Not implemented');
    }

    public onServerStreaming(
        context: MethodInvocationContext, 
        request: plexus.plexus.interop.testing.IEchoRequest, 
        hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>): void {
        throw new Error('Not implemented');        
    }

    public onClientStreaming(
        context: MethodInvocationContext, 
        hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>): InvocationObserver<plexus.plexus.interop.testing.IEchoRequest> {
        throw new Error('Not implemented');        
    }

    public onDuplexStreaming(
        context: MethodInvocationContext, 
        hostClient: StreamingInvocationClient<plexus.plexus.interop.testing.IEchoRequest>): InvocationObserver<plexus.plexus.interop.testing.IEchoRequest> {
        throw new Error('Not implemented');        
    }

}