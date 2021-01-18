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
    using System.Threading;
    using System.Threading.Tasks;

    internal static class TaskRunner
    {
        public static TaskScheduler BackgroundScheduler { get; set; } = TaskScheduler.Default;

        public static Task RunInBackground(Action action, CancellationToken cancellationToken = new CancellationToken())
        {
            return Task.Factory.StartNew(action, cancellationToken, TaskCreationOptions.PreferFairness, BackgroundScheduler);
        }

        public static Task RunInBackground(Action<object> action, object state, CancellationToken cancellationToken = new CancellationToken())
        {
            return Task.Factory.StartNew(action, state, cancellationToken, TaskCreationOptions.PreferFairness, BackgroundScheduler);
        }

        public static Task RunInBackground(Func<object, Task> action, object state, CancellationToken cancellationToken = new CancellationToken())
        {
            return Task.Factory.StartNew(action, state, cancellationToken, TaskCreationOptions.PreferFairness, BackgroundScheduler).Unwrap();
        }

        public static Task<T> RunInBackground<T>(Func<T> action, CancellationToken cancellationToken = new CancellationToken())
        {
            return Task.Factory.StartNew(action, cancellationToken, TaskCreationOptions.PreferFairness, BackgroundScheduler);
        }

        public static Task<T> RunInBackground<T>(Func<Task<T>> action, CancellationToken cancellationToken = new CancellationToken())
        {
            return Task.Factory.StartNew(action, cancellationToken, TaskCreationOptions.PreferFairness, BackgroundScheduler).Unwrap();
        }

        public static Task RunInBackground(Func<Task> action, CancellationToken cancellationToken = new CancellationToken())
        {
            return Task.Factory.StartNew(action, cancellationToken, TaskCreationOptions.PreferFairness, BackgroundScheduler).Unwrap();
        }
    }
}
