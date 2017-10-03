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
﻿using System.Threading;
using System;
using System.Threading.Tasks;

namespace Plexus.Channels
{
    public sealed class ProducingChannel<T> : IReadableChannel<T>, ITerminatableChannel
    {
        private readonly Func<IWriteOnlyChannel<T>, CancellationToken, Task> _produceAsync;
        private readonly CancellationTokenSource _cancellation = new CancellationTokenSource();
        private readonly IChannel<T> _buffer;

        public ProducingChannel(int bufferSize, Func<IWriteOnlyChannel<T>, CancellationToken, Task> produceAsync)
        {
            _buffer = new BufferedChannel<T>(bufferSize);
            _produceAsync = produceAsync;
            Completion = TaskRunner.RunInBackground(ProcessAsync);
        }

        public Task Completion { get; }

        public bool TryComplete()
        {
            if (_buffer.Out.TryComplete())
            {
                _cancellation.Cancel();
                return true;
            }
            return false;
        }

        public Task<bool> WaitForNextSafeAsync()
        {
            return _buffer.In.WaitForNextSafeAsync();
        }

        public bool TryReadSafe(out T item)
        {
            return _buffer.In.TryReadSafe(out item);
        }

        public bool TryTerminate(Exception ex = null)
        {
            if (_buffer.Out.TryTerminate(ex))
            {
                _cancellation.Cancel();
                return true;
            }
            return false;
        }

        private async Task ProcessAsync()
        {
            try
            {
                await _produceAsync(_buffer.Out, _cancellation.Token).ConfigureAwait(false);
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
