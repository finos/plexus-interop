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
namespace Plexus
{
    using System;
    using System.Runtime.CompilerServices;
    using System.Threading;
    using System.Threading.Tasks;

    internal struct AwaitableCancellationToken<T> : IDisposable
    {
        private readonly Task<T> _task;
        private readonly CancellationTokenRegistration _registration;

        public AwaitableCancellationToken(CancellationToken cancellationToken)
        {            
            if (cancellationToken.IsCancellationRequested)
            {
                _task = TaskConstants<T>.Canceled;
                _registration = default;
            }
            else if (cancellationToken.CanBeCanceled)
            {
                var promise = new Promise<T>();
                _task = promise.Task;
                _registration = promise.AssignCancellationToken(cancellationToken);
            }
            else
            {
                _task = TaskConstants<T>.Infinite;
                _registration = default;
            }
        }

        public Task<T> AsTask()
        {
            return _task ?? TaskConstants<T>.Infinite;
        }

        public TaskAwaiter<T> GetAwaiter()
        {
            return _task.GetAwaiter();
        }

        public ConfiguredTaskAwaitable<T> ConfigureAwait(bool continueOnCapturedContext)
        {
            return _task.ConfigureAwait(continueOnCapturedContext);
        }

        public void Dispose()
        {
            _registration.Dispose();
        }
    }
}
