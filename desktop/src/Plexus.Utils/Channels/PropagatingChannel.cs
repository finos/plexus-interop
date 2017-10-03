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
    public sealed class PropagatingChannel<T, TOut> : IWritableChannel<T>
    {
        private readonly IChannel<T> _buffer;
        private readonly Func<T, IWriteOnlyChannel<TOut>, Task> _propagateAsync;
        private readonly Func<IWriteOnlyChannel<TOut>, Task> _completeConsumeAsync;
        private readonly Func<Exception, IWriteOnlyChannel<TOut>, Task> _terminateConsumeAsync;
        private readonly Action<T> _disposeRejected;
        private readonly IWritableChannel<TOut> _out;
        private readonly Func<IWriteOnlyChannel<TOut>, Task> _beginConsumeAsync;

        public PropagatingChannel(
            int bufferSize,
            IWritableChannel<TOut> output,
            Func<IWriteOnlyChannel<TOut>, Task> beginConsumeAsync,
            Func<T, IWriteOnlyChannel<TOut>, Task> consumeAsync,
            Func<IWriteOnlyChannel<TOut>, Task> completeConsumeAsync,
            Func<Exception, IWriteOnlyChannel<TOut>, Task> terminateConsumeAsync,
            Action<T> disposeRejected)
        {
            _buffer = new BufferedChannel<T>(bufferSize);
            _out = output;
            _beginConsumeAsync = beginConsumeAsync;
            _propagateAsync = consumeAsync;
            _completeConsumeAsync = completeConsumeAsync;
            _terminateConsumeAsync = terminateConsumeAsync;
            _disposeRejected = disposeRejected;
            Completion = TaskRunner.RunInBackground(ProcessAsync);
        }

        public PropagatingChannel(
            int bufferSize,
            IWritableChannel<TOut> output,
            Func<T, IWriteOnlyChannel<TOut>, Task> consumeAsync,
            Action<T> disposeRejected)
            : this(bufferSize, output, null, consumeAsync, null, null, disposeRejected)
        {
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
                if (_beginConsumeAsync != null)
                {
                    await _beginConsumeAsync(_out).ConfigureAwait(false);
                }
                await _buffer.ConsumeBufferAsync(PropagateAsync, _disposeRejected).ConfigureAwait(false);
                if (_completeConsumeAsync != null)
                {
                    await _completeConsumeAsync(_out).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                if (_terminateConsumeAsync != null)
                {
                    await _terminateConsumeAsync(ex, _out).IgnoreExceptions().ConfigureAwait(false);
                }
                throw;
            }
            finally
            {
                try
                {
                    await _buffer.In.Completion.ConfigureAwait(false);
                    _out.TryComplete();
                }
                catch (Exception ex)
                {
                    _out.TryTerminate(ex);
                    throw;
                }
                finally
                {
                    await _out.Completion.ConfigureAwait(false);
                }
            }
        }

        private async Task PropagateAsync(T item)
        {
            await _propagateAsync(item, _out).ConfigureAwait(false);
        }
    }
}
