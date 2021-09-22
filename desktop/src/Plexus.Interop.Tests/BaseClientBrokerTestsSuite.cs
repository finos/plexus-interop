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
namespace Plexus.Interop
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Plexus.Interop.Testing;
    using Xunit;
    using Xunit.Abstractions;

    public abstract class BaseClientBrokerTestsSuite : TestsSuite, IClassFixture<TestBrokerFixture>
    {
        protected readonly TestBrokerFixture _testBrokerFixture;

        public BaseClientBrokerTestsSuite(ITestOutputHelper output, TestBrokerFixture testBrokerFixture) : base(output)
        {
            _testBrokerFixture = testBrokerFixture;
            _testBrokerFixture.OnBeforeTest();
            TaskScheduler.UnobservedTaskException += OnUnobservedTaskException;
        }

        private readonly List<Exception> _unobservedExceptions = new List<Exception>();

        private void OnUnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs e)
        {
            lock (_unobservedExceptions)
            {
                _unobservedExceptions.AddRange(e.Exception.InnerExceptions);
            }
        }

        public override void Dispose()
        {
            try
            {
                base.Dispose();
                _testBrokerFixture.OnAfterTest();
                VerifyNoUnobservedTaskExceptions();
            }
            finally
            {
                TaskScheduler.UnobservedTaskException -= OnUnobservedTaskException;
            }
        }

        private void VerifyNoUnobservedTaskExceptions()
        {
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            lock (_unobservedExceptions)
            {
                if (_unobservedExceptions.Count > 0)
                {
                    throw new AggregateException(
                        "Unhandled task exceptions after test run",
                        _unobservedExceptions);
                }
            }
        }

        protected T CreateClient<T>() where T : ClientBase
        {
            Func<ClientOptionsBuilder, ClientOptionsBuilder> builderFunc = builder => builder;
            builderFunc = builder => builder.WithBrokerWorkingDir(_testBrokerFixture.SharedInstance.WorkingDir);
            var instance = (T)Activator.CreateInstance(typeof(T), builderFunc);
            RegisterDisposable(instance);
            return instance;
        }
    }
}
