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
﻿namespace Plexus
{
    using Shouldly;
    using System;
    using System.Threading.Tasks;

    public static class ShoudlyExtensions
    {
        public static void ShouldCompleteIn(this Task task, TimeSpan timeout)
        {
            Should.CompleteIn(task, timeout);
        }

        public static void ShouldThrow<TException>(this Task task, TimeSpan timeout) where TException : Exception
        {
            Should.Throw<TException>(task, timeout);
        }

        public static T ShouldCompleteIn<T>(this Task<T> task, TimeSpan timeout)
        {
            return Should.CompleteIn(task, timeout);
        }

        public static T ShouldCompleteIn<T>(this ValueTask<T> task, TimeSpan timeout)
        {
            return Should.CompleteIn(task.AsTask(), timeout);
        }
    }
}
