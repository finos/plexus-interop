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
    using System.Threading.Tasks;

    public abstract class ProcessBase : IProcess
    {
        private readonly Latch _started = new Latch();
        private readonly Promise _completion = new Promise();
        private readonly Promise _startCompletion = new Promise();

        public Task Completion => _completion.Task;

        public Task StartCompletion => _startCompletion.Task;

        public void Start()
        {
            if (!_started.TryEnter())
            {
                return;
            }
            var startTask = TaskRunner.RunInBackground(StartCoreAsync);
            startTask.PropagateCompletionToPromise(_startCompletion);
            startTask.Unwrap().PropagateCompletionToPromise(_completion);
        }        

        protected abstract Task<Task> StartCoreAsync();
    }
}
