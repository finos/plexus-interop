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
﻿using System;
using System.Threading.Tasks;

namespace Plexus.Channels
{
    public sealed class ConsumingChannel<T> : IWritableChannel<T>
    {
        private readonly IChannel<T> _buffer;
        private readonly Func<T, Task> _consumeAsync;
        private readonly Func<Task> _onCompletedAsync;
        private readonly Action<T> _disposeRejected;

        public ConsumingChannel(int bufferSize, Func<T, Task> consumeAsync, Func<Task> onCompletedAsync, Action<T> disposeRejected)
        {
            _buffer = new BufferedChannel<T>(bufferSize);
            _consumeAsync = consumeAsync;
            _onCompletedAsync = onCompletedAsync;
            _disposeRejected = disposeRejected;
            Completion = TaskRunner.RunInBackground(ProcessAsync);
        }

        public Task Completion { get; }

        public bool TryComplete()
        {
            return _buffer.Out.TryComplete();
        }

        public bool TryTerminate(Exception error = null)
        {
            return _buffer.Out.TryTerminate(error);
        }

        public bool TryWriteSafe(T item)
        {
            return _buffer.Out.TryWriteSafe(item);
        }

        public Task<bool> TryWriteSafeAsync(T item)
        {
            return _buffer.Out.TryWriteSafeAsync(item);
        }

        private async Task ProcessAsync()
        {
            try
            {
                await _buffer.ConsumeBufferAsync(_consumeAsync, _disposeRejected).ConfigureAwait(false);
                await _onCompletedAsync().ConfigureAwait(false);
                _buffer.Out.TryComplete();
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                await _buffer.In.Completion.ConfigureAwait(false);
            }
        }
    }
}
