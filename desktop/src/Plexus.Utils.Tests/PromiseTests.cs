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
namespace Plexus
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Xunit;

    public sealed class PromiseTests : IDisposable
    {
        [Fact]
        public void NoUnobservedExceptionsOnPromise()
        {
            var promise = new Promise();
            promise.TryFail(new Exception("NoUnobservedExceptionsOnPromise!"));
        }

        [Fact]
        public void NoUnobservedExceptionsOnGenericPromise()
        {
            var promise = new Promise<bool>();
            promise.TryFail(new Exception("NoUnobservedExceptionsOnGenericPromise!"));
        }

        [Fact]
        public void NoUnobservedTaskExceptionsAfterCompletionLogged()
        {
            var promise = new Promise();            
            promise.Task.LogCompletion(LogManager.GetLogger<PromiseTests>());
            promise.TryFail(new Exception("NoUnobservedTaskExceptionsAfterCompletionLogged!"));
        }

        private static void VerifyNoUnobservedTaskExceptions()
        {
            var list = new List<Exception>();

            void CatchUnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs args)
            {
                lock (list)
                {
                    list.Add(args.Exception);
                }
            }

            TaskScheduler.UnobservedTaskException += CatchUnobservedTaskException;
            try
            {
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                if (list.Count > 0)
                {
                    throw new AggregateException(list);
                }
            }
            finally
            {
                TaskScheduler.UnobservedTaskException -= CatchUnobservedTaskException;
            }
        }

        public void Dispose()
        {
            VerifyNoUnobservedTaskExceptions();
        }
    }
}