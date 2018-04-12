/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Protocol.Internal
{
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Pools;

    internal sealed class ConsumedMethodReference : PooledObject<ConsumedMethodReference>, IConsumedMethodReference
    {
        protected override void Cleanup()
        {
            ConsumedService?.Dispose();
            ConsumedService = default;
            MethodId = default;
        }

        public T Handle<T, TArgs>(InvocationTargetHandler<T, TArgs> handler, TArgs args)
        {
            return handler.Handle(this, args);
        }

        public IConsumedServiceReference ConsumedService { get; set; }

        public string MethodId { get; set; }

        public override string ToString()
        {
            return $"{nameof(ConsumedService)}: {{{ConsumedService}}}, {nameof(MethodId)}: {MethodId}";
        }

        private bool Equals(ConsumedMethodReference other)
        {
            return Equals(ConsumedService, other.ConsumedService) && string.Equals(MethodId, other.MethodId);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is ConsumedMethodReference && Equals((ConsumedMethodReference) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return ((ConsumedService != null ? ConsumedService.GetHashCode() : 0) * 397) ^ (MethodId != null ? MethodId.GetHashCode() : 0);
            }
        }
    }
}
