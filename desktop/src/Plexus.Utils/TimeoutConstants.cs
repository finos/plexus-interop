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
namespace Plexus
{
    using System;

    internal static class TimeoutConstants
    {
        public static readonly double TimeoutMultiplier = EnvironmentHelper.GetPlexusTimeoutMultiplier();

        public static readonly TimeSpan Timeout10Ms = TimeSpan.FromMilliseconds(10 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout50Ms = TimeSpan.FromMilliseconds(50 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout100Ms = TimeSpan.FromMilliseconds(100 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout250Ms = TimeSpan.FromMilliseconds(250 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout500Ms = TimeSpan.FromMilliseconds(500 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout1Sec = TimeSpan.FromSeconds(1 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout3Sec = TimeSpan.FromSeconds(3 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout5Sec = TimeSpan.FromSeconds(5 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout10Sec = TimeSpan.FromSeconds(10 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout20Sec = TimeSpan.FromSeconds(20 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout30Sec = TimeSpan.FromSeconds(30 * TimeoutMultiplier);
        public static readonly TimeSpan Timeout1Min = TimeSpan.FromMinutes(1 * TimeoutMultiplier);
    }
}
