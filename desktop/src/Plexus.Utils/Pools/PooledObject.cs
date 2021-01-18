/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Pools
{
    using System;
    using System.Diagnostics;
    using System.Threading;

    internal static class PooledObject
    {
        public static long Counter;
    }

    internal abstract class PooledObject<T> : IPooledObject
        where T : PooledObject<T>, new()
    {
        private static readonly ILogger Log = LogManager.GetLogger<PooledObject<T>>();

        private static readonly ObjectPool<T> Pool = ObjectPool.Create(() => new T(), 32);     

        private readonly long _id;

        protected PooledObject()
        {
            _refCount = 1;
            _id = Interlocked.Increment(ref PooledObject.Counter);
            Log.Trace("Creating {0}. Current ref count: {1}", _id, _refCount);
        }

        public static T Rent()
        {
            Log.Trace("Rent. Objects in pool: {0}", Pool.Count);
            var obj = Pool.GetObject();
            if (obj._isSuspended)
            {
                obj.Resurrect();                
            }
            else
            {
                obj.Cleanup();                
            }
            obj.Init();
            return obj;
        }

        private bool _isSuspended;
        private int _refCount;

        protected virtual void Init()
        {
            Log.Trace("Init {0}. Current ref count: {1}", _id, _refCount);
        }

        private void Resurrect()
        {
            _isSuspended = false;
            var refCount = Interlocked.Exchange(ref _refCount, 1);            
            Log.Trace("Resurrect {0}. Current ref count: {1}", _id, _refCount);
            if (refCount != 0)
            {
                if (Log.IsWarnEnabled())
                {
                    Log.Warn("Invalid ref count after dispose {0}: {1}\n{2}", _id, refCount, Environment.StackTrace);
                }
#if DEBUG
                throw new InvalidOperationException($"Invalid ref count {refCount} after resurrecting pooled object {_id} of type {GetType()}");
#endif
            }
        }

        protected abstract void Cleanup();

        public void Retain()
        {            
            Interlocked.Increment(ref _refCount);
            Log.Trace("Retain {0}. Current ref count: {1}", _id, _refCount);
        }

        [Conditional("DEBUG")]
        protected void CheckNotDisposed()
        {
            if (_refCount <= 0)
            {
                throw new InvalidOperationException("refCount < 0");
            }
        }

        public void Dispose()
        {            
            var refCount = Interlocked.Decrement(ref _refCount);
            Log.Trace("Dispose {0}. Current ref count: {1}", _id, refCount);
            if (refCount == 0)
            {
                Cleanup();
                _isSuspended = true;
                Pool.PutObject((T)this);                
                Log.Trace("Returned to pool {0}. Objects in pool: {1}", _id, Pool.Count);
            }
            else if (refCount < 0)
            {
                if (Log.IsWarnEnabled())
                {
                    Log.Warn("Invalid ref count after dispose {0}: {1}\n{2}", _id, refCount, Environment.StackTrace);
                }
#if DEBUG
                throw new InvalidOperationException($"Invalid ref count {refCount} after disposing pooled object {_id} of type {GetType()}");
#endif
            }
        }
    }
}
