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
    using Shouldly;
    using System;
    using System.Collections.Concurrent;
    using System.Diagnostics;
    using System.Security.Cryptography;
    using System.Threading;
    using System.Threading.Tasks;
    using Xunit;
    using Xunit.Abstractions;

    [Collection("Default")]
    [DisplayTestMethodName]
    public abstract class TestsSuite : IDisposable
    {
        private readonly ConcurrentStack<IDisposable> _disposables = new ConcurrentStack<IDisposable>();

        protected static readonly Random Random = new Random(42);

        protected static readonly MD5 Md5 = MD5.Create();

        protected static readonly TimeSpan Timeout10Ms = TimeoutConstants.Timeout10Ms;
        protected static readonly TimeSpan Timeout50Ms = TimeoutConstants.Timeout50Ms;
        protected static readonly TimeSpan Timeout100Ms = TimeoutConstants.Timeout100Ms;
        protected static readonly TimeSpan Timeout1Sec = TimeoutConstants.Timeout1Sec;
        protected static readonly TimeSpan Timeout5Sec = TimeoutConstants.Timeout5Sec;
        protected static readonly TimeSpan Timeout10Sec = TimeoutConstants.Timeout10Sec;
        protected static readonly TimeSpan Timeout20Sec = TimeoutConstants.Timeout20Sec;
        protected static readonly TimeSpan Timeout30Sec = TimeoutConstants.Timeout30Sec;

        protected ITestOutputHelper Console { get; }

#if NET45
        static TestsSuite()
        {
            // For .NET 4.5 increasing min threads count to avoid starvation and slow running in the cases 
            // when we're creating a lot of connections in the same process concurrently (which is not a very realistic scenario in real world case)
            ThreadPool.GetMaxThreads(out var minWorkerThreads, out var minCompletionPortThreads);
            ThreadPool.SetMinThreads(minWorkerThreads, minCompletionPortThreads);
        }
#endif

        protected TestsSuite() : this(null)
        {
        }

        protected TestsSuite(ITestOutputHelper output)
        {
            Console = output;
            Log = LogManager.GetLogger(GetType());
        }

        protected void WriteLog(string message)
        {
            Log.Info(message);
            Console?.WriteLine(message);
        }

        protected ILogger Log { get; }

        protected T RegisterDisposable<T>(T disposable) where T : IDisposable
        {
            _disposables.Push(disposable);
            return disposable;
        }

        protected void RunWith30SecTimeout(Func<Task> func) => RunWithTimeout(Timeout30Sec, func);
        protected void RunWith30SecTimeout(Action action) => RunWithTimeout(Timeout30Sec, action);
        protected void RunWith20SecTimeout(Func<Task> func) => RunWithTimeout(Timeout20Sec, func);
        protected void RunWith20SecTimeout(Action action) => RunWithTimeout(Timeout20Sec, action);
        protected void RunWith10SecTimeout(Func<Task> func) => RunWithTimeout(Timeout10Sec, func);
        protected void RunWith10SecTimeout(Action action) => RunWithTimeout(Timeout10Sec, action);
        protected void RunWith5SecTimeout(Func<Task> func) => RunWithTimeout(Timeout5Sec, func);
        protected void RunWith5SecTimeout(Action action) => RunWithTimeout(Timeout5Sec, action);
        protected void RunWith1SecTimeout(Func<Task> func) => RunWithTimeout(Timeout1Sec, func);
        protected void RunWith1SecTimeout(Action action) => RunWithTimeout(Timeout1Sec, action);

        protected void RunWithTimeout(TimeSpan timeout, Func<Task> func)
        {
            if (Debugger.IsAttached)
            {
                TaskRunner.RunInBackground(func).GetResult();
                return;
            }
            using (var cancellation = new CancellationTokenSource(timeout))
            {
                try
                {
                    TaskRunner
                        .RunInBackground(func, cancellation.Token)
                        .WithCancellation(cancellation.Token)
                        .GetResult();
                }
                catch (OperationCanceledException) when (cancellation.IsCancellationRequested)
                {
                    throw new TimeoutException($"Task not completed after {timeout.TotalMilliseconds} ms");
                }
            }
        }

        protected void RunWithTimeout(TimeSpan timeout, Action action)
            => RunWithTimeout(
                timeout,
                () =>
                {
                    action();
                    return TaskConstants.Completed;
                });

        public virtual void Dispose()
        {
            RunWith5SecTimeout(
                () =>
                {
                    WriteLog("Disposing test resources");
                    while (_disposables.TryPop(out var disposable))
                    {
                        WriteLog($"Disposing {disposable.GetType().FullName}");
                        disposable.Dispose();
                        WriteLog($"Disposed {disposable.GetType().FullName}");
                    }
                    WriteLog("Test resources disposed");
                });
        }
    }
}