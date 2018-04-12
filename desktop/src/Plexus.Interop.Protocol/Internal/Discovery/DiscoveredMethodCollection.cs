/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Protocol.Internal.Discovery
{
    using Plexus.Interop.Protocol.Discovery;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;

    internal sealed class DiscoveredMethodCollection : IReadOnlyCollection<IDiscoveredMethod>
    {
        private readonly IReadOnlyCollection<IDiscoveredMethod> _collection;

        public DiscoveredMethodCollection(IReadOnlyCollection<IDiscoveredMethod> collection)
        {
            _collection = collection;
        }

        public int Count => _collection.Count;

        public IEnumerator<IDiscoveredMethod> GetEnumerator()
        {
            return _collection.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return _collection.GetEnumerator();
        }

        public override string ToString()
        {
            return $"[{string.Join(", ", _collection)}]";
        }

        public override bool Equals(object obj)
        {
            return obj is DiscoveredMethodCollection other &&
                   _collection.SequenceEqual(other._collection);
        }

        public override int GetHashCode()
        {
            var hashCode = -989839414;
            foreach (var item in _collection)
            {
                hashCode = hashCode * -1521134295 + EqualityComparer<IDiscoveredMethod>.Default.GetHashCode(item);
            }
            return hashCode;
        }
    }
}
