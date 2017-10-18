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
﻿namespace Plexus.Processes
{
    using System.Threading;
    using System.Threading.Tasks;

    public abstract class ProcessBase : IProcess
    {
        private readonly Latch _started = new Latch();
        private readonly Latch _stopped = new Latch();
        private readonly Promise _completion = new Promise();
        private readonly Promise _startCompletion = new Promise();        
        private readonly CancellationTokenSource _stopCancellation = new CancellationTokenSource();

        public Task Completion => _completion.Task;

        public Task StartCompletion => _startCompletion.Task;

        protected CancellationToken StopToken => _stopCancellation.Token;

        protected virtual Task OnStopAsync()
        {
            return TaskConstants.Completed;
        }

        protected virtual Task OnCompletedAsync(Task completion)
        {
            return completion;
        }

        protected abstract Task<Task> StartCoreAsync();

        public void Start()
        {
            if (!_started.TryEnter())
            {
                return;
            }
            var startTask = TaskRunner.RunInBackground(StartCoreAsync, StopToken);
            startTask
                .IgnoreCancellation(StopToken)
                .PropagateCompletionToPromise(_startCompletion);
            startTask
                .Unwrap()                
                .ContinueWithSynchronously(OnCompletedAsync, CancellationToken.None)
                .IgnoreCancellation(StopToken)
                .PropagateCompletionToPromise(_completion);
        }

        public Task StartAsync()
        {
            Start();
            return StartCompletion;
        }

        public void Stop()
        {
            if (!_stopped.TryEnter())
            {
                return;
            }
            _stopCancellation.Cancel();
            Start();
        }

        public async Task StopAsync()
        {
            Stop();
            await Completion.IgnoreExceptions().ConfigureAwait(false);
        }

        public void Dispose()
        {
            StopAsync().GetResult();
            _stopCancellation.Dispose();
        }

        protected void SetStartCompleted()
        {
            _startCompletion.TryComplete();
        }
    }
}
