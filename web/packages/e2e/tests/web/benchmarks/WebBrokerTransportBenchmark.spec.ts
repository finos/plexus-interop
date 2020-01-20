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
import { expect } from 'chai';
import { ClientsSetup } from '../../common/ClientsSetup';
import { TransportsSetup } from '../../common/TransportsSetup';
import { readHostUrl } from '../../common/utils';
import { EchoClientBenchmark } from '../../echo/EchoClientBenchmark';

describe('Web Broker Client Benchmarks', () => {

    const clientsSetup = new ClientsSetup(500);
    const transportsSetup = new TransportsSetup();

    const proxyHost = readHostUrl();

    const echoServiceBenchmark = new EchoClientBenchmark(
        transportsSetup.createCrossDomainTransportProvider(proxyHost), 
        clientsSetup);

    it('Sends ~20 point to point requests in 1 second', function() {
        this.timeout(6000);
        return (async () => {
            const result = await echoServiceBenchmark.testUnaryMessagesSentWithinPeriod(1024, 3000);
            console.log('Benchmark result:', JSON.stringify(result));
            expect(result.messagesSent).to.be.greaterThan(60);
        })();
    });

    it('Sends ~200 streaming messages in 1 second', function() {
        this.timeout(6000);
        return (async () => {
            const result = await echoServiceBenchmark.testStreamingEventsSentWithinPeriod(1024, 3000);
            console.log('Benchmark result:', JSON.stringify(result));
            expect(result.messagesSent).to.be.greaterThan(600);
        })();
    });

});