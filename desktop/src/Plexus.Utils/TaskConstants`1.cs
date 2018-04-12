/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
    using System.Threading.Tasks;

    internal static class TaskConstants<T>
    {
        public static readonly Task<T> Canceled;

        public static readonly ValueTask<T> CanceledValue;

        public static readonly Task<T> Infinite;

        public static readonly Task<T> Completed;

        static TaskConstants()
        {
            var canceled = new TaskCompletionSource<T>();
            canceled.SetCanceled();;
            Canceled = canceled.Task;
            CanceledValue = new ValueTask<T>(Canceled);
            var infinite = new TaskCompletionSource<T>();
            Infinite = infinite.Task;
            var completed = new TaskCompletionSource<T>();
            completed.SetResult(default);
            Completed = completed.Task;
        }
    }
}
