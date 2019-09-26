/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
    using System.Threading;
    using System.Threading.Tasks;
#if  NET45
    using Amib.Threading;
#endif

    internal sealed class Promise
    {
        #if NET45        

        // In .NET 4.5 there is no option TaskCreationOptions.RunContinuationsAsynchronously available for TaskCompletionSource class.
        // It means that we need to implicitly complete TaskCompletionSource on thread pool to avoid blocking calling thread and re-entrance deadlocks.
        // However completing on .NET default thread pool leads to thread starvation, so we need to use the separate thread pool to schedule completion and continuations.

        private static readonly SmartThreadPool SmartThreadPool = 
            new SmartThreadPool(new STPStartInfo
            {
                MinWorkerThreads = Environment.ProcessorCount,
                MaxWorkerThreads = 1000,
                ApartmentState = ApartmentState.MTA,
                AreThreadsBackground = true,
                IdleTimeout = (int)TimeSpan.FromSeconds(20).TotalMilliseconds,
                UseCallerCallContext = false,
                UseCallerHttpContext = false,
                WorkItemPriority = WorkItemPriority.Normal,
            });

        static Promise()
        {            
            SmartThreadPool.Start();
        }

        internal static void ScheduleCompletionAction(Action action)
        {
            SmartThreadPool.QueueWorkItem(action);
        }

        #endif

        private readonly Promise<Nothing> _inner = new Promise<Nothing>();

        public Task Task => _inner.Task;

        public bool TryComplete() => _inner.TryComplete(Nothing.Instance);

        public bool TryCancel() => _inner.TryCancel();

        public bool TryFail(Exception error) => _inner.TryFail(error);

        public bool TryFail(IEnumerable<Exception> errors) => _inner.TryFail(errors);

        public void PropagateCompletionFrom(Task task)
        {
            task.PropagateCompletionToPromise(this);
        }
    }
}