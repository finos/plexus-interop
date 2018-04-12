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
    using System.Collections.Generic;

    internal sealed class IncomingInvocationDescriptor
    {
        public IncomingInvocationDescriptor(
            InvocationMethodDescriptor method,
            InvocationSourceDescriptor source)
        {
            Method = method;
            Source = source;
        }

        public InvocationSourceDescriptor Source { get; }

        public InvocationMethodDescriptor Method { get; }

        public override bool Equals(object obj)
        {
            return obj is IncomingInvocationDescriptor descriptor &&
                   EqualityComparer<InvocationSourceDescriptor>.Default.Equals(Source, descriptor.Source) &&
                   EqualityComparer<InvocationMethodDescriptor>.Default.Equals(Method, descriptor.Method);
        }

        public override int GetHashCode()
        {
            var hashCode = -809999864;
            hashCode = hashCode * -1521134295 + EqualityComparer<InvocationSourceDescriptor>.Default.GetHashCode(Source);
            hashCode = hashCode * -1521134295 + EqualityComparer<InvocationMethodDescriptor>.Default.GetHashCode(Method);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{{Type: {nameof(IncomingInvocationDescriptor)}, {nameof(Method)}: {Method}, {nameof(Source)}: {Source}}}";
        }


    }
}
