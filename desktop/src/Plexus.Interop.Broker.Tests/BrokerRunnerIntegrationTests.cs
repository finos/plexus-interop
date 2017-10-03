/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Broker
{
    using Shouldly;
    using Xunit;

    public sealed class BrokerRunnerIntegrationTests : TestsSuite
    {
        [Fact]
        public void BrokerStopWhenThereAreNoConnections()
        {
            RunWith10SecTimeout(async () =>
            {
                var broker = RegisterDisposable(new BrokerRunner("TestBroker/metadata"));
                await broker.StartAsync();
                await broker.StopAsync();
            });
        }

        [Fact]
        public void CannotStartTwoBrokersInTheSameWorkingDir()
        {
            RunWith10SecTimeout(async () =>
            {
                var broker1 = RegisterDisposable(new BrokerRunner("TestBroker/metadata"));
                var broker2 = RegisterDisposable(new BrokerRunner("TestBroker/metadata"));
                await broker1.StartAsync();
                Should.Throw<BrokerIsAlreadyRunningException>(() => broker2.StartAsync(), Timeout1Sec);
                await broker1.StopAsync();
            });
        }
    }
}
