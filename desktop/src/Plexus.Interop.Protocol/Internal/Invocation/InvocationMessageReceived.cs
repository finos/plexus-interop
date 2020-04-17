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
﻿using Plexus.Interop.Protocol.Invocation;

namespace Plexus.Interop.Protocol.Internal.Invocation
{
    internal sealed class InvocationMessageReceived : IInvocationMessageReceived
    {
        public static readonly InvocationMessageReceived Instance = new InvocationMessageReceived();

        public override string ToString()
        {
            return $"{{Type: {GetType().Name}}}";
        }

        public override bool Equals(object obj)
        {
            return obj is InvocationMessageReceived;
        }

        public override int GetHashCode()
        {
            return 0;
        }

        public void Dispose()
        {
        }

        public void Retain()
        {
        }

        public T Handle<T, TArgs>(InvocationMessageHandler<T, TArgs> handler, TArgs args)
        {
            return handler.Handle(this, args);
        }
    }
}
