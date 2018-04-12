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
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class Promise<T>
    {
#if NET45
        private readonly TaskCompletionSource<T> _completion = new TaskCompletionSource<T>(TaskCreationOptions.None);

        private int _isCompleted;

        public Task<T> Task => _completion.Task;

        public bool TryComplete(T result)
        {
            bool completed;
            if (Interlocked.Exchange(ref _isCompleted, 1) == 0)
            {
                TaskRunner.RunInBackground(() => _completion.SetResult(result));
                completed = true;
            }
            else
            {
                completed = false;
            }
            Task.Wait();
            return completed;
        }

        public bool TryCancel()
        {
            bool completed;
            if (Interlocked.Exchange(ref _isCompleted, 1) == 0)
            {
                TaskRunner.RunInBackground(() => _completion.SetCanceled());
                completed = true;
            }
            else
            {
                completed = false;
            }
            try
            {
                Task.Wait();
            }
            catch
            {
                // ignored
            }
            return completed;
        }

        public bool TryFail(Exception error)
        {
            if (error is OperationCanceledException)
            {
                return TryCancel();
            }
            bool completed;
            if (Interlocked.Exchange(ref _isCompleted, 1) == 0)
            {
                TaskRunner.RunInBackground(() => _completion.SetException(error));
                completed = true;
            }
            else
            {
                completed = false;
            }
            try
            {
                Task.Wait();
            }
            catch
            {
                // ignored
            }
            return completed;
        }

        public bool TryFail(IEnumerable<Exception> errors)
        {
            bool completed;
            if (Interlocked.Exchange(ref _isCompleted, 1) == 0)
            {
                TaskRunner.RunInBackground(() => _completion.SetException(errors));
                completed = true;
            }
            else
            {
                completed = false;
            }
            try
            {
                Task.Wait();
            }
            catch
            {
                // ignored
            }
            return completed;
        }

#else
        private readonly TaskCompletionSource<T> _completion = new TaskCompletionSource<T>(TaskCreationOptions.RunContinuationsAsynchronously);

        public Promise()
        {
            Task = _completion.Task;
        }

        public Task<T> Task { get; }

        public bool TryComplete(T result) => _completion.TrySetResult(result);

        public bool TryCancel() => _completion.TrySetCanceled();

        public bool TryFail(Exception error)
        {
            if (error is OperationCanceledException)
            {
                return TryCancel();
            }
            return _completion.TrySetException(error);
        }

        public bool TryFail(IEnumerable<Exception> errors) => _completion.TrySetException(errors);
#endif

        public void PropagateCompletionFrom(Task<T> task)
        {
            task.PropagateCompletionToPromise(this);
        }

        public CancellationTokenRegistration AssignCancellationToken(CancellationToken cancellationToken)
        {
            if (!cancellationToken.CanBeCanceled)
            {
                return default;
            }
            if (cancellationToken.IsCancellationRequested)
            {
                TryCancel();
                return default;
            }
            var registration = cancellationToken.Register(CancelPromiseOnCancellationRequested, this, false);
            Task.ContinueWithSynchronously(DisposeCancellationRegistrationOnPromiseCompleted, registration, CancellationToken.None);
            return registration;
        }

        private static Task<TResult> DisposeCancellationRegistrationOnPromiseCompleted<TResult>(Task<TResult> task, object state)
        {
            var r = (CancellationTokenRegistration) state;
            r.Dispose();
            return task;
        }

        private static void CancelPromiseOnCancellationRequested(object obj)
        {
            var p = (Promise<T>) obj;
            p.TryCancel();
        }
    }
}