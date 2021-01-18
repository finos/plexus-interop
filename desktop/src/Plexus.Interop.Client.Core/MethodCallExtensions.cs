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
﻿namespace Plexus.Interop
{
    using System.Runtime.CompilerServices;
    using System.Threading.Tasks;

    public static class MethodCallExtensions
    {
        /// <summary>
        /// Allows converting this object to Task.
        /// </summary>
        public static Task AsTask(this IUnaryMethodCall methodCall)
        {
            return methodCall.ResponseAsync;
        }

        /// <summary>
        /// Allows awaiting this object directly.
        /// </summary>
        public static TaskAwaiter GetAwaiter(this IUnaryMethodCall methodCall)
        {
            return methodCall.ResponseAsync.GetAwaiter();
        }

        /// <summary>
        /// Allows configuring awaiting for this object.
        /// </summary>
        public static ConfiguredTaskAwaitable ConfigureAwait(
            this IUnaryMethodCall methodCall, bool continueOnCapturedContext)
        {
            return methodCall.ResponseAsync.ConfigureAwait(continueOnCapturedContext);
        }

        /// <summary>
        /// Allows converting this object to Task.
        /// </summary>
        public static Task<TResponse> AsTask<TResponse>(this IUnaryMethodCall<TResponse> methodCall)
        {
            return methodCall.ResponseAsync;
        }

        /// <summary>
        /// Allows awaiting this object directly.
        /// </summary>
        public static TaskAwaiter<TResponse> GetAwaiter<TResponse>(this IUnaryMethodCall<TResponse> methodCall)
        {
            return methodCall.ResponseAsync.GetAwaiter();
        }

        /// <summary>
        /// Allows configuring awaiting for this object.
        /// </summary>
        public static ConfiguredTaskAwaitable<TResponse> ConfigureAwait<TResponse>(
            this IUnaryMethodCall<TResponse> methodCall, bool continueOnCapturedContext)
        {
            return methodCall.ResponseAsync.ConfigureAwait(continueOnCapturedContext);
        }
    }
}
