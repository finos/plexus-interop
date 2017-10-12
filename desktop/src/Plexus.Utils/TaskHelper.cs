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
﻿using System;
using System.Threading.Tasks;

namespace Plexus
{
    using System.Threading;

    public static class TaskHelper
    {
        public static Task<T> FromException<T>(Exception exception)
        {
            if (exception is AggregateException aggrEx)
            {
                exception = aggrEx.ExtractInner();
            }
            var tcs = new TaskCompletionSource<T>();
            tcs.SetException(exception);
            return tcs.Task;
        }

        public static async Task AsTask(this CancellationToken cancellationToken)
        {
            var promise = new Promise();
            using (cancellationToken.Register(() => promise.TryComplete()))
            {
                await promise.Task.ConfigureAwait(false);
            }
        }
    }
}
