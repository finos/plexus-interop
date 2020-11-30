/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Protocol.Internal.Invocation
{
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Pools;

    internal sealed class InvocationStart : PooledObject<InvocationStart>, IInvocationStart
    {
        public T Handle<T, TArgs>(ClientToBrokerRequestHandler<T, TArgs> handler, TArgs args = default)
        {
            return handler.Handle(this, args);
        }

        protected override void Cleanup()
        {
            Target = default;
        }

        public IInvocationTarget Target { get; set; }

        public IContextLinkageOptions ContextLinkageOptions { get; set; }

        public override string ToString()
        {
            return $"{nameof(Target)}: {Target}";
        }

        private bool Equals(InvocationStart other)
        {
            return Equals(Target, other.Target) && Equals(ContextLinkageOptions, other.ContextLinkageOptions);
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || obj is InvocationStart other && Equals(other);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return ((Target != null ? Target.GetHashCode() : 0) * 397) ^ (ContextLinkageOptions != null ? ContextLinkageOptions.GetHashCode() : 0);
            }
        }

        public static bool operator ==(InvocationStart left, InvocationStart right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(InvocationStart left, InvocationStart right)
        {
            return !Equals(left, right);
        }
    }
}
