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
﻿namespace Plexus.Channels
{
    using System;
    using System.Collections.Generic;
    using System.Runtime.CompilerServices;
    using System.Threading.Tasks;

    public sealed class BufferedChannel<T> : IChannel<T>, IReadableChannel<T>, IWritableChannel<T>
    {
        private readonly int _bufferSize;
        private readonly Queue<T> _buffer;
        private readonly Queue<QueuedWrite> _writeQueue = new Queue<QueuedWrite>(Environment.ProcessorCount);
        private readonly object _sync = new object();

        private Promise _readCompletion = new Promise();
        private Promise _writeCompletion = new Promise();
        private Promise<bool> _readAvailable = new Promise<bool>();
        private int _balance;

        public BufferedChannel(int bufferSize)
        {
            if (bufferSize < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(bufferSize), bufferSize, "Buffer size must be non-negative");
            }
            _bufferSize = bufferSize;
            _buffer = new Queue<T>(_bufferSize + 1);
        }

        internal void Reset()
        {
            lock (_sync)
            {
                TryTerminate();                
                _buffer.Clear();
                _balance = 0;
                _readCompletion = new Promise();
                _writeCompletion = new Promise();
                _readAvailable = new Promise<bool>();
            }
        }

        public Task Completion => _readCompletion.Task;

        Task IWriteOnlyChannel<T>.Completion => _writeCompletion.Task;

        public IWritableChannel<T> Out => this;

        public IReadableChannel<T> In => this;

        public Task<bool> WaitForNextSafeAsync()
        {
            lock (_sync)
            {
                return _readAvailable.Task;
            }
        }

        public bool TryReadSafe(out T item)
        {
            bool result;
            lock (_sync)
            {
                if (_readCompletion.Task.IsCompleted)
                {
                    item = default;
                    return false;
                }

                while (_balance > _bufferSize)
                {
                    var queuedWrite = _writeQueue.Dequeue();
                    if (queuedWrite.TryComplete(true))
                    {
                        _buffer.Enqueue(queuedWrite.Item);
                        break;
                    }
                    _balance--;
                }

                if (_balance > 0)
                {
                    item = _buffer.Dequeue();
                    _balance--;                    
                    result = true;
                }
                else
                {
                    item = default;
                    result = false;
                }
                OnBalanceChanged();
                TryCompleteRead();
            }
            return result;
        }

        public bool TryWriteSafe(T item)
        {
            lock (_sync)
            {
                if (_writeCompletion.Task.IsCompleted)
                {
                    return false;
                }

                if (_balance >= _bufferSize)
                {
                    return false;
                }

                _buffer.Enqueue(item);
                _balance++;
                OnBalanceChanged();
                return true;
            }
        }

        public Task<bool> TryWriteSafeAsync(T item)
        {
            lock (_sync)
            {
                if (TryWriteSafe(item))
                {
                    return TaskConstants.True;
                }

                if (_writeCompletion.Task.IsCompleted)
                {
                    return TaskConstants.False;
                }

                var queuedWrite = new QueuedWrite(item);
                _writeQueue.Enqueue(queuedWrite);
                _balance++;
                OnBalanceChanged();
                return queuedWrite.Task;
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
                while (_balance > _bufferSize)
                {
                    var queuedWriter = _writeQueue.Dequeue();
                    _balance--;
                    queuedWriter.TryComplete(false);
                }
                OnBalanceChanged();
                TryCompleteRead();
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
                    while (_balance > _bufferSize)
                    {
                        var queuedWriter = _writeQueue.Dequeue();
                        _balance--;
                        queuedWriter.TryComplete(false);
                    }
                    OnBalanceChanged();
                    TryCompleteRead();
                }
                return result;
            }
        }

        private void OnBalanceChanged()
        {
            if (_balance > 0)
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
            if (_balance != 0)
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

        private sealed class QueuedWrite : Promise<bool>
        {
            public QueuedWrite(T item)
            {
                Item = item;
            }

            public T Item { get; }
        }
    }
}