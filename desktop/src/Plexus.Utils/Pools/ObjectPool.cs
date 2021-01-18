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
    using System.Collections.Concurrent;

    internal static class ObjectPool
    {
        public static ObjectPool<T> Create<T>(Func<T> objectGenerator, int maxRetainedObjects = default)
        {
            return new ObjectPool<T>(objectGenerator, maxRetainedObjects);
        }

        public static ObjectPool<T> Create<T>(int maxRetainedObjects = default) where T : new()
        {
            return new ObjectPool<T>(() => new T());
        }
    }

    internal sealed class ObjectPool<T>
    {
        private readonly ConcurrentBag<T> _objects;
        private readonly Func<T> _objectGenerator;
        private readonly int _maxRetainedObjects;

        internal ObjectPool(Func<T> objectGenerator, int maxRetainedObjects = default)
        {
            _objectGenerator = objectGenerator ?? throw new ArgumentNullException(nameof(objectGenerator));
            _maxRetainedObjects = maxRetainedObjects == default ? Environment.ProcessorCount * 2 : maxRetainedObjects;
            _objects = new ConcurrentBag<T>();
        }

        public int Count => _objects.Count;

        public T GetObject()
        {
            if (!_objects.TryTake(out T item))
            {
                item = _objectGenerator();
            }
            return item;
        }

        public void PutObject(T item)
        {
            if (_objects.Count < _maxRetainedObjects)
            {
                _objects.Add(item);
            }
        }
    }
}