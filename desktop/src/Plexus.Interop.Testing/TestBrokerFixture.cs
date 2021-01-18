/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Testing
{
    using System;
    using System.Collections.Concurrent;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class TestBrokerFixture : IDisposable
    {
        private static readonly ILogger Log = LogManager.GetLogger<TestBrokerFixture>();
        
        private ConcurrentBag<TestBroker> _additionalBrokers = new ConcurrentBag<TestBroker>();

        private int _additionalBrokerId;

        public TestBrokerFixture()
        {
            EnsureSharedBrokerRunning();
        }

        public ITestBroker SharedInstance { get; private set; }

        public void OnBeforeTest()
        {
            _additionalBrokers = new ConcurrentBag<TestBroker>();
            EnsureSharedBrokerRunning();
        }        

        public void OnAfterTest()
        {
            Task.WhenAll(_additionalBrokers.Select(x => x.StopAsync())).ShouldCompleteIn(TimeoutConstants.Timeout10Sec);
            if (SharedInstance.Completion.IsCompleted)
            {
                throw new InvalidOperationException(
                    "Default test broker unexpectedly closed",
                    SharedInstance.Completion.Exception?.ExtractInner());
            }
        }

        public ITestBroker CreateBroker()
        {
            var id = Interlocked.Increment(ref _additionalBrokerId);
            Log.Info("Creating broker {0}", id);
            var additionalBroker = new TestBroker(id.ToString());
            _additionalBrokers.Add(additionalBroker);
            return additionalBroker;
        }

        public void Dispose()
        {
            OnAfterTest();
            if (SharedInstance != null && !SharedInstance.Completion.IsCompleted)
            {
                SharedInstance.StopAsync().ShouldCompleteIn(TimeoutConstants.Timeout10Sec);
            }            
        }

        private void EnsureSharedBrokerRunning()
        {
            if (SharedInstance == null || SharedInstance.Completion.IsCompleted)
            {
                Log.Info("Starting shared test broker");
                SharedInstance = new TestBroker("shared");
                SharedInstance.StartAsync().ShouldCompleteIn(TimeoutConstants.Timeout10Sec);
            }
        }
    }
}
