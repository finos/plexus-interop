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
namespace Plexus
{
    using System;
    using System.Runtime.CompilerServices;
    using System.Threading;
    using System.Threading.Tasks;

    internal static class TaskHelper
    {
        private static readonly ILogger Log = LogManager.GetLogger(typeof(TaskHelper));

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> FromException<T>(Exception exception)
        {
            if (exception is AggregateException aggrEx)
            {
                exception = aggrEx.ExtractInner();
            }
            var tcs = new TaskCompletionSource<T>();
            tcs.SetException(exception);
            return tcs.Task;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> AsTask<T>(this CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                return TaskConstants<T>.Canceled;
            }
            if (!cancellationToken.CanBeCanceled)
            {
                return TaskConstants<T>.Infinite;
            }
            var promise = new Promise<T>();
            var registration = cancellationToken.Register(() => promise.TryCancel());
            var task = promise.Task;
            task.ContinueWithInBackground(t => registration.Dispose(), CancellationToken.None).IgnoreAwait(Log);
            return task;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task AsTask(this CancellationToken cancellationToken)
        {
            return cancellationToken.AsTask<Nothing>();
        }
    }
}
