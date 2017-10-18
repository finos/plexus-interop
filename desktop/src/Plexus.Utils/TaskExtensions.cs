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
 using System;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;

namespace Plexus
{
    public static class TaskExtensions
    {
        private static readonly ILogger Log = LogManager.GetLogger(typeof(TaskExtensions));

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithInBackground(this Task task, Action<Task> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, cancellationToken, TaskContinuationOptions.None,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithInBackground<T1>(this Task<T1> task, Action<Task<T1>> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, cancellationToken, TaskContinuationOptions.None,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T2> ContinueWithInBackground<T1, T2>(this Task<T1> task, Func<Task<T1>, T2> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, cancellationToken, TaskContinuationOptions.None,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> ContinueWithInBackground<T>(this Task task, Func<Task, T> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, cancellationToken, TaskContinuationOptions.None,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithInBackground(this Task task, Func<Task, Task> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, cancellationToken, TaskContinuationOptions.None,
                TaskRunner.BackgroundScheduler).Unwrap();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithSynchronously(this Task task, Action<Task> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithSynchronously<T>(this Task<T> task, Action<Task<T>> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithSynchronously(this Task task, Action<Task, object> func, object state,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, state, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> ContinueWithSynchronously<T>(this Task task, Func<Task, object, T> func, object state,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, state, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithSynchronously(this Task task, Func<Task, object, Task> func, object state,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, state, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler).Unwrap();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> ContinueWithSynchronously<T>(this Task task, Func<Task, object, Task<T>> func,
            object state, CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, state, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler).Unwrap();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithSynchronously(this Task task, object state, Action<Task, object> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, state, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithSynchronously<T>(this Task<T> task, object state, Action<Task<T>, object> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(func, state, cancellationToken, TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithOnErrorSynchronously(this Task task, Action<Task> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(
                func,
                cancellationToken,
                TaskContinuationOptions.ExecuteSynchronously | TaskContinuationOptions.OnlyOnFaulted,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T2> ContinueWithSynchronously<T1, T2>(this Task<T1> task, Func<Task<T1>, T2> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(
                func,
                cancellationToken,
                TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> ContinueWithSynchronously<T>(this Task task, Func<Task, T> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(
                func,
                cancellationToken,
                TaskContinuationOptions.ExecuteSynchronously,
                TaskRunner.BackgroundScheduler);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ContinueWithSynchronously(this Task task, Func<Task, Task> func,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWith(
                    func,
                    cancellationToken,
                    TaskContinuationOptions.ExecuteSynchronously,
                    TaskRunner.BackgroundScheduler)
                .Unwrap();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task WithBackgroundContinuations(this Task task,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWithInBackground(t => t.GetResult(), cancellationToken);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> WithBackgroundContinuations<T>(this Task<T> task,
            CancellationToken cancellationToken = new CancellationToken())
        {
            return task.ContinueWithInBackground(t => t.GetResult(), cancellationToken);
        }

        public static Task LogAndIgnoreExceptions(this Task task, ILogger log)
        {
            return task.ContinueWithSynchronously((Action<Task, object>) LogAndIgnoreExceptionsOnCompletedTask, log);
        }

        private static void LogAndIgnoreExceptionsOnCompletedTask(Task task, object state)
        {
            var logger = (ILogger) state;
            if (task.IsFaulted)
            {
                logger.Error(task.Exception.ExtractInner(), "Exception on non-awaited task");
            }
        }

        public static Task IgnoreExceptions(this Task task)
        {
            return task.ContinueWithSynchronously((Action<Task>) IgnoreExceptionsOnCompletedTask);
        }

        public static Task IgnoreAnyCancellation(this Task task)
        {
            return task.ContinueWithSynchronously((Action<Task>) IgnoreCancellationOnCompletedTask);
        }

        public static Task IgnoreCancellation(this Task task, CancellationToken cancellationToken)
        {
            return task.ContinueWithSynchronously(t => t.IgnoreCancellationOnCompletedTask(cancellationToken), CancellationToken.None);
        }

        private static void IgnoreExceptionsOnCompletedTask(this Task task)
        {
            bool HandleException(Exception e)
            {
                return true;
            }

            if (task.IsFaulted)
            {
                task.Exception.Handle(HandleException);
            }
        }

        private static void IgnoreCancellationOnCompletedTask(this Task task, CancellationToken cancellationToken)
        {
            if (!task.IsCanceled || !cancellationToken.IsCancellationRequested)
            {
                task.GetResult();
            }
        }

        private static void IgnoreCancellationOnCompletedTask(this Task task)
        {
            if (!task.IsCanceled)
            {
                task.GetResult();
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static T GetResult<T>(this Task<T> task)
        {
            return task.ConfigureAwait(false).GetAwaiter().GetResult();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void GetResult(this Task task)
        {
            task.GetAwaiter().GetResult();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void PropagateCompletionToPromise(this Task task, Promise promise)
        {
            if (task.IsCompleted)
            {
                PropagateCompletedTaskToPromise(task, promise);
            }
            else
            {
                task.ContinueWithSynchronously(promise, PropagateCompletedTaskToPromise);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void PropagateCompletedTaskToPromise(Task task, object promiseObj)
        {
            var promise = (Promise) promiseObj;
            PropagateCompletedTaskToPromise(task, promise);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void PropagateCompletedTaskToPromise(Task task, Promise promise)
        {
            if (task.IsCanceled)
            {
                promise.TryCancel();
            }
            else if (task.IsFaulted)
            {
                promise.TryFail(task.Exception.InnerExceptions);
            }
            else
            {
                promise.TryComplete();
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void PropagateCompletionToPromise<T>(this Task<T> task, Promise<T> promise)
        {
            if (task.IsCompleted)
            {
                PropagateCompletedTaskToPromise(task, promise);
            }
            else
            {
                task.ContinueWithSynchronously<T>(promise, PropagateCompletedTaskToPromise);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void PropagateCompletedTaskToPromise<T>(Task<T> task, object promiseObj)
        {
            var promise = (Promise<T>) promiseObj;
            PropagateCompletedTaskToPromise(task, promise);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void PropagateCompletedTaskToPromise<T>(Task<T> task, Promise<T> promise)
        {
            if (task.IsCanceled)
            {
                promise.TryCancel();
            }
            else if (task.IsFaulted)
            {
                promise.TryFail(task.Exception.InnerExceptions);
            }
            else
            {
                promise.TryComplete(task.Result);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> WithTimeoutAsync<T>(this ValueTask<T> task, TimeSpan timeout)
        {
            return task.AsTask().WithTimeoutAsync(timeout);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async Task WithTimeoutAsync(this Task task, TimeSpan timeout)
        {
            var timeoutPromise = new Promise();
            using (var cancellation = new CancellationTokenSource(timeout))
            using (cancellation.Token.Register(() => timeoutPromise.TryCancel()))
            {
                var completed = await Task.WhenAny(task, timeoutPromise.Task).ConfigureAwait(false);
                if (completed == task)
                {
                    task.GetResult();
                }
                else
                {
                    throw new TimeoutException(
                        $"Task did not completed in the specified timeout {timeout.TotalMilliseconds}ms");
                }
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async Task<T> WithTimeoutAsync<T>(this Task<T> task, TimeSpan timeout)
        {
            var timeoutPromise = new Promise();
            using (var cancellation = new CancellationTokenSource(timeout))
            using (cancellation.Token.Register(() => timeoutPromise.TryCancel()))
            {
                var completed = await Task.WhenAny(task, timeoutPromise.Task).ConfigureAwait(false);
                if (completed == task)
                {
                    return task.GetResult();
                }
                else
                {
                    throw new TimeoutException(
                        $"Task did not completed in the specified timeout {timeout.TotalMilliseconds}ms");
                }
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ConfiguredTaskAwaitable ConfigureAwaitWithTimeout(this Task task, TimeSpan timeout)
        {
            return task.WithTimeoutAsync(timeout).ConfigureAwait(false);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ConfiguredTaskAwaitable<T> ConfigureAwaitWithTimeout<T>(this Task<T> task, TimeSpan timeout)
        {
            return task.WithTimeoutAsync(timeout).ConfigureAwait(false);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ConfiguredTaskAwaitable<T> ConfigureAwaitWithTimeout<T>(this ValueTask<T> task, TimeSpan timeout)
        {
            return task.WithTimeoutAsync(timeout).ConfigureAwait(false);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ValueTask<T> AsValueTask<T>(this Task<T> task)
        {
            return new ValueTask<T>(task);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task<T> WithCancellation<T>(
            this Task<T> task, 
            CancellationToken cancellationToken, 
            Action<Task<T>> disposeAction = null)
        {
            if (!cancellationToken.CanBeCanceled || task.IsCompleted)
            {
                return task;
            }
            if (cancellationToken.IsCancellationRequested)
            {
                return TaskConstants<T>.Canceled;
            }

            async Task<T> WithCancellationAsync()
            {
                var completedTask = await Task.WhenAny(task, cancellationToken.AsTask<T>()).ConfigureAwait(false);
                if (completedTask == task)
                {
                    return completedTask.GetResult();
                }
                if (disposeAction != null)
                {
                    task.ContinueWithSynchronously(disposeAction, CancellationToken.None).IgnoreAwait(Log);
                }
                else
                {
                    task.IgnoreAwait(Log);
                }
                return await completedTask.ConfigureAwait(false);
            }

            return WithCancellationAsync();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task WithCancellation(
            this Task task, 
            CancellationToken cancellationToken, 
            Action<Task> disposeAction = null)
        {
            if (!cancellationToken.CanBeCanceled || task.IsCompleted)
            {
                return task;
            }
            if (cancellationToken.IsCancellationRequested)
            {
                return TaskConstants.Canceled;
            }

            async Task WithCancellationAsync()
            {
                var completedTask = await Task.WhenAny(task, cancellationToken.AsTask()).ConfigureAwait(false);
                if (completedTask != task)
                {
                    if (disposeAction != null)
                    {
                        task.ContinueWithSynchronously(disposeAction, CancellationToken.None).IgnoreAwait(Log);
                    }
                    else
                    {
                        task.IgnoreAwait(Log);
                    }
                }
                completedTask.GetResult();
            }

            return WithCancellationAsync();
        }
    }
}
