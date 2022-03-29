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
namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    internal sealed class IncomingInvocationDescriptor
    {
        public InvocationMethodDescriptor Method { get; }

        public AppConnectionDescriptor Source { get; }

        public IncomingInvocationDescriptor(
            InvocationMethodDescriptor method,
            AppConnectionDescriptor source)
        {
            Method = method;
            Source = source;
        }

        public override bool Equals(object obj)
            => obj is IncomingInvocationDescriptor other
            && Method.Equals(other.Method)
            && Source.Equals(other.Source);

        public override int GetHashCode()
            => Method.GetHashCode()
            ^ Source.GetHashCode();

        public override string ToString()
            => $"{{Type: {nameof(IncomingInvocationDescriptor)}, " +
               $"{nameof(Method)}: {Method}, " +
               $"{nameof(Source)}: {Source}}}";


    }
}
