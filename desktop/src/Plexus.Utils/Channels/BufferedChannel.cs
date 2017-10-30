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
namespace Plexus.Channels
{
    using System;
    using System.Collections.Generic;
    using System.Runtime.CompilerServices;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class BufferedChannel<T> : IChannel<T>, IReadableChannel<T>, ITerminatableWritableChannel<T>
    {
        private readonly object _sync = new object();
        private readonly Queue<T> _buffer = new Queue<T>();        
        private readonly Promise _readCompletion = new Promise();
        private readonly Promise _writeCompletion = new Promise();
        private readonly int _bufferSize;

        private Promise<bool> _readAvailable = new Promise<bool>();
        private Promise<bool> _writeAvailable = new Promise<bool>();

        public BufferedChannel(int bufferSize)
        {
            if (bufferSize < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(bufferSize), bufferSize, "Buffer size must be non-negative");
            }
            _bufferSize = bufferSize;
            OnBalanceChanged();
        }

        public Task Completion => _readCompletion.Task;

        Task IWritableChannel<T>.Completion => _writeCompletion.Task;

        public ITerminatableWritableChannel<T> Out => this;

        public IReadableChannel<T> In => this;        

        public bool TryRead(out T item)
        {
            lock (_sync)
            {
                if (_buffer.Count == 0)
                {
                    item = default;
                    return false;
                }
                item = _buffer.Dequeue();
                OnBalanceChanged();
                return true;
            }
        }

        public bool TryWrite(T item)
        {
            lock (_sync)
            {
                if (_writeCompletion.Task.IsCompleted || _buffer.Count >= _bufferSize)
                {
                    return false;
                }
                _buffer.Enqueue(item);
                OnBalanceChanged();
                return true;
            }
        }

        public Task<bool> WaitReadAvailableAsync(CancellationToken cancellationToken = default)
        {
            lock (_sync)
            {
                return _readAvailable.Task.WithCancellation(cancellationToken);
            }
        }

        public Task<bool> WaitWriteAvailableAsync(CancellationToken cancellationToken = default)
        {
            lock (_sync)
            {
                return _writeAvailable.Task.WithCancellation(cancellationToken);
            }
        }

        public bool TryComplete()
        {
            lock (_sync)
            {
                if (!_writeCompletion.TryComplete())
                {
                    return false;
                }
                OnBalanceChanged();
                return true;
            }
        }

        public bool TryTerminate(Exception error = null)
        {
            lock (_sync)
            {
                var result = error == null || error is OperationCanceledException
                    ? _writeCompletion.TryCancel()
                    : _writeCompletion.TryFail(error);
                if (result)
                {
                    OnBalanceChanged();
                }
                return result;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private void OnBalanceChanged()
        {
            if (_writeCompletion.Task.IsCompleted)
            {
                ComputeAvailabilityFromCompletion(_writeCompletion.Task, ref _writeAvailable);
            }
            else if (_buffer.Count < _bufferSize)
            {
                _writeAvailable.TryComplete(true);
            }
            else if (_writeAvailable.Task.IsCompleted && _writeAvailable.Task.Result)
            {
                _writeAvailable = new Promise<bool>();
            }

            TryCompleteRead();

            if (_readCompletion.Task.IsCompleted)
            {
                ComputeAvailabilityFromCompletion(_readCompletion.Task, ref _readAvailable);
            }
            else if (_buffer.Count > 0)
            {
                _readAvailable.TryComplete(true);
            }
            else if (_readAvailable.Task.IsCompleted && _readAvailable.Task.Result)
            {
                _readAvailable = new Promise<bool>();
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void ComputeAvailabilityFromCompletion(Task completion, ref Promise<bool> availability)
        {
            if (availability.Task.IsCompleted)
            {
                availability = new Promise<bool>();
            }
            if (completion.IsCanceled)
            {
                availability.TryCancel();
            }
            else if (completion.IsFaulted)
            {
                if (completion.Exception != null)
                {
                    availability.TryFail(completion.Exception.InnerExceptions);
                }
                else
                {
                    availability.TryCancel();
                }
            }
            else
            {
                availability.TryComplete(false);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private void TryCompleteRead()
        {
            if (_buffer.Count != 0)
            {
                return;
            }            
            if (!_writeCompletion.Task.IsCompleted)
            {
                return;
            }
            if (_readCompletion.Task.IsCompleted)
            {
                return;
            }
            if (_writeCompletion.Task.IsCanceled)
            {
                _readCompletion.TryCancel();
            }
            else if (_writeCompletion.Task.IsFaulted && _writeCompletion.Task.Exception != null)
            {
                _readCompletion.TryFail(_writeCompletion.Task.Exception.InnerExceptions);
            }
            else
            {
                _readCompletion.TryComplete();
            }            
        }
    }
}