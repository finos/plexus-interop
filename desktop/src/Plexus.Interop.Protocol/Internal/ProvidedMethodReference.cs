/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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

    internal sealed class ProvidedMethodReference : PooledObject<ProvidedMethodReference>, IProvidedMethodReference
    {
        public T Handle<T, TArgs>(InvocationTargetHandler<T, TArgs> handler, TArgs args)
        {
            return handler.Handle(this, args);
        }

        public T Handle<T, TArg1, TArg2>(InvocationTargetHandler<T, TArg1, TArg2> handler, TArg1 arg1 = default, TArg2 arg2 = default)
        {
            return handler.Handle(this, arg1, arg2);
        }

        public IProvidedServiceReference ProvidedService { get; set; }

        public string MethodId { get; set; }

        protected override void Cleanup()
        {
            ProvidedService?.Dispose();
            ProvidedService = default;
            MethodId = default;
        }

        public override string ToString()
        {
            return $"{nameof(ProvidedService)}: {{{ProvidedService}}}, {nameof(MethodId)}: {MethodId}";
        }

        private bool Equals(ProvidedMethodReference other)
        {
            return Equals(ProvidedService, other.ProvidedService) && string.Equals(MethodId, other.MethodId);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is ProvidedMethodReference && Equals((ProvidedMethodReference) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return ((ProvidedService != null ? ProvidedService.GetHashCode() : 0) * 397) ^ (MethodId != null ? MethodId.GetHashCode() : 0);
            }
        }
    }
}
