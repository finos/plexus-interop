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
// tslint:disable: only-arrow-functions
// tslint:disable: typedef
// tslint:disable: no-invalid-this
import { ClientsSetup } from '../common/ClientsSetup';
import { TransportsSetup } from '../common/TransportsSetup';
import { readWsUrl } from '../common/utils';
import { PointToPointInvocationTests } from '../echo/PointToPointInvocationTests';

describe('Client: Web Socket Point to Point invocation', () => {

    const clientsSetup = new ClientsSetup();
    const transportsSetup = new TransportsSetup();

    const wsUrl = readWsUrl();    
    
    const pointToPointTests = new PointToPointInvocationTests(
        transportsSetup.createWebSocketTransportProvider(wsUrl),
        clientsSetup);

    it('Sends invocation request and receives response', function() {
        return pointToPointTests.testMessageSent();
    });

    it('Sends invocation request to aliased service and receives response', function() {
        return pointToPointTests.testAliasedServiceInvoked();
    });

    it('Sends invocation request with huge payload and receives response', function() {
        this.timeout(10000);
        return pointToPointTests.testHugeMessageSent();
    });

    it('Sends few invocations in a row', function() {
        return pointToPointTests.testFewMessagesSent();
    });

    it('Receives error from host', function() {
        return pointToPointTests.testHostsExecutionErrorReceived();
    });

    it('Receives Client Error from host', function() {
        return pointToPointTests.testHostsExecutionClientErrorReceived();
    });

    it('Receives string error from host', function() {
        return pointToPointTests.testHostsExecutionStringErrorReceived();
    });

    it('Receives exception from host', function() {
        return pointToPointTests.testHostExecutionExceptionReceived();
    });

    it('Supports cancel of Unary Invocation by Generated Client', () => {
        return pointToPointTests.testGeneratedClientCanCancelUnaryInvocation();
    });

    it('Supports receiving of result from cancellable Unary Invocation by Generated Client', () => {
        return pointToPointTests.testGeneratedClientCanGetResponseFromCancellableUnaryInvocation();
    });

});