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

    public sealed class BufferedChannel<T> : IChannel<T>, IReadOnlyChannel<T>, IWritableChannel<T>
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

        Task IWriteOnlyChannel<T>.Completion => _writeCompletion.Task;

        public IWritableChannel<T> Out => this;

        public IReadOnlyChannel<T> In => this;        

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
                if (_readCompletion.Task.IsFaulted || _readCompletion.Task.IsCanceled)
                {
                    _readCompletion.Task.GetResult();
                }
                else if (_readCompletion.Task.IsCompleted)
                {
                    return TaskConstants.False;
                }
                return _readAvailable.Task.WithCancellation(cancellationToken);
            }
        }

        public Task<bool> WaitWriteAvailableAsync(CancellationToken cancellationToken = default)
        {
            lock (_sync)
            {
                if (_writeCompletion.Task.IsFaulted || _writeCompletion.Task.IsCanceled)
                {
                    _writeCompletion.Task.GetResult();
                }
                else if (_writeCompletion.Task.IsCompleted)
                {
                    return TaskConstants.False;
                }
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
                _writeAvailable.TryComplete(false);
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
                _readAvailable.TryComplete(false);
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
            _readAvailable.TryComplete(false);
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