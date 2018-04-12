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
﻿namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    internal sealed class OutcomingInvocationDescriptor
    {
        public OutcomingInvocationDescriptor(
            InvocationMethodDescriptor method,
            InvocationTargetDescriptor target = null)
        {
            Method = method;
            Target = target ?? Maybe<InvocationTargetDescriptor>.Nothing;
        }

        public InvocationMethodDescriptor Method { get; }

        public Maybe<InvocationTargetDescriptor> Target { get; }

        public override string ToString()
        {
            return $"{{Type: {nameof(OutcomingInvocationDescriptor)}, {nameof(Method)}: {Method}, {nameof(Target)}: {Target}}}";
        }

        private bool Equals(OutcomingInvocationDescriptor other)
        {
            return Equals(Method, other.Method) && Target.Equals(other.Target);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is OutcomingInvocationDescriptor && Equals((OutcomingInvocationDescriptor) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return ((Method != null ? Method.GetHashCode() : 0) * 397) ^ Target.GetHashCode();
            }
        }
    }
}
