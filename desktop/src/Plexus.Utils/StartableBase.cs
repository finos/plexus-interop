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
﻿namespace Plexus
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    public abstract class StartableBase : IStartable
    {
        private readonly ILogger _log;

        private readonly Promise _startCompletion = new Promise();
        private readonly Promise _completion = new Promise();

        private readonly CancellationTokenSource _stopCancellation = new CancellationTokenSource();        
        private readonly Lazy<Task> _startTaskLazy;

        protected StartableBase(ILogger log = null)
        {
            _startTaskLazy = new Lazy<Task>(StartCoreAsync);
            _log = log ?? LogManager.GetLogger(GetType(), "StartableBase");
            Completion.LogCompletion(_log);
        }

        public Task StartCompletion => _startCompletion.Task;

        public Task Completion => _completion.Task;

        public void Start()
        {
            StartAsync().IgnoreAwait(_log);
        }

        public void Stop()
        {
            StopAsync().IgnoreAwait(_log);
        }

        public Task StartAsync()
        {            
            return _startTaskLazy.Value;
        }

        public async Task StopAsync()
        {            
            if (_stopCancellation.IsCancellationRequested)
            {
                return;
            }
            _log.Trace("Stopping");
            _stopCancellation.Cancel();
            await _startTaskLazy.Value.ConfigureAwait(false);
            await Completion.ConfigureAwait(false);
        }

        public void Dispose()
        {
            _log.Trace("Disposing");
            TaskRunner.RunInBackground(StopAsync).LogAndIgnoreExceptions(_log).GetResult();
        }

        protected abstract Task<Task> StartProcessAsync(CancellationToken stopCancellationToken);

        private async Task StartCoreAsync()
        {            
            try
            {
                _log.Trace("Starting");
                _stopCancellation.Token.ThrowIfCancellationRequested();                
                var processTask = await TaskRunner
                    .RunInBackground(
                        () => StartProcessAsync(_stopCancellation.Token),
                        _stopCancellation.Token)
                    .ConfigureAwait(false);
                processTask.ContinueWithSynchronously((Action<Task>)OnProcessCompleted).IgnoreAwait(_log);
                _startCompletion.TryComplete();
            }
            catch (OperationCanceledException) when (_stopCancellation.IsCancellationRequested)
            {
                _log.Trace("Start canceled");
                _startCompletion.TryComplete();
                _completion.TryComplete();                
            }
            catch (Exception ex)
            {
                _log.Trace("Start failed: {0}", ex.FormatTypeAndMessage());
                _startCompletion.TryFail(ex);
                _completion.TryFail(ex);
                throw;
            }
        }

        private void OnProcessCompleted(Task t)
        {            
            if (t.IsCanceled && _stopCancellation.IsCancellationRequested)
            {                
                _completion.TryComplete();
            }
            else
            {
                t.PropagateCompletionToPromise(_completion);                
            }            
        }
    }
}
