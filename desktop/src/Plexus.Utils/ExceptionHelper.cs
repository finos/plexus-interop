/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
namespace Plexus
{
    using AsyncFriendlyStackTrace;
    using System;
    using System.Runtime.CompilerServices;
    using System.Runtime.ExceptionServices;

    public static class ExceptionHelper
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Exception ExtractInner(this AggregateException exception)
        {
            return exception?.InnerExceptions.Count == 1 ? exception.InnerExceptions[0] : exception;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void RethrowToKeepStackTrace(this Exception ex)
        {
            ExceptionDispatchInfo.Capture(ex).Throw();
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string FormatTypeAndMessage(this Exception ex)
        {
            if (ex == null)
            {
                return string.Empty;
            }
            return ex.GetType() + ": " + ex.Message;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static string FormatToString(this Exception ex)
        {
            if (ex == null)
            {
                return string.Empty;
            }
            return ex.ToAsyncString();
        }
    }
}
