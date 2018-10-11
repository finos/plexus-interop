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
import { ClientsSetup } from '../common/ClientsSetup';
import { TransportsSetup } from '../common/TransportsSetup';
import { readWsUrl } from '../common/utils';
import { PointToPointInvocationTests } from '../echo/PointToPointInvocationTests';
import { UnaryServiceHandler } from '../echo/UnaryServiceHandler';
import { MethodInvocationContext } from '@plexus-interop/client-api';
import { InvocationRequestInfo } from '@plexus-interop/client';
import { BaseEchoTest } from '../echo/BaseEchoTest';
import { UrlInteropRegistryProvider } from '@plexus-interop/metadata';
import { DynamicBinaryMarshallerProvider } from '@plexus-interop/io/dist/main/src/dynamic';
import { InteropPlatformFactory } from '@plexus-interop/common-api-impl';
import { expect } from 'chai';

// tslint:disable:no-unused-expression
describe('Client: Common API Implementation', () => {

    const webSocketUrl = readWsUrl();    

    const factory = new InteropPlatformFactory();

    it('Creates Interop Platform Factory', async () => {
        
        const platform = await factory.createPlatform({ webSocketUrl });    
        expect(platform).to.not.be.undefined;
              
    });

});