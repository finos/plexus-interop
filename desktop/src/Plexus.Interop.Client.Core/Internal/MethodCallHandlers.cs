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
﻿namespace Plexus.Interop.Internal
{
    using Plexus.Interop.Internal.Calls;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;

    internal sealed class MethodCallHandlers
    {
        public static IMethodCallHandler Unary<TRequest, TResponse>(
            UnaryMethodHandler<TRequest, TResponse> methodHandler,
            IIncomingInvocationFactory incomingInvocationFactory)
        {
            return new UnaryMethodCallHandler<TRequest, TResponse>(methodHandler, incomingInvocationFactory);
        }

        public static IMethodCallHandler ClientStreaming<TRequest, TResponse>(
            ClientStreamingMethodHandler<TRequest, TResponse> methodHandler,
            IIncomingInvocationFactory incomingInvocationFactory)
        {
            return new ClientStreamingMethodCallHandler<TRequest, TResponse>(methodHandler, incomingInvocationFactory);
        }

        public static IMethodCallHandler ServerStreaming<TRequest, TResponse>(
            ServerStreamingMethodHandler<TRequest, TResponse> methodHandler,
            IIncomingInvocationFactory incomingInvocationFactory)
        {
            return new ServerStreamingMethodCallHandler<TRequest, TResponse>(methodHandler, incomingInvocationFactory);
        }

        public static IMethodCallHandler DuplexStreaming<TRequest, TResponse>(
            DuplexStreamingMethodHandler<TRequest, TResponse> methodHandler,
            IIncomingInvocationFactory incomingInvocationFactory)
        {
            return new DuplexStreamingMethodCallHandler<TRequest, TResponse>(methodHandler, incomingInvocationFactory);
        }
    }
}
