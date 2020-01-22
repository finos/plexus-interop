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
﻿using System;
using System.Runtime.CompilerServices;

namespace Plexus
{
    public sealed class NoopLogger : ILogger
    {
        public static readonly NoopLogger Instance = new NoopLogger();

        public string Name => "NoopLogger";

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public bool IsLogLevelEnabled(LogLevel level)
        {
            return true;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log(LogLevel logLevel, Exception exception, string message)
        {
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1>(LogLevel logLevel, Exception exception, string message, T1 arg1)
        {
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2)
        {
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3)
        {
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
        {
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4, T5>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
        {
        }

        public void Log<T1, T2, T3, T4, T5, T6>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
        {
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log(LogLevel logLevel, Exception exception, string message, params object[] args)
        {
        }
    }
}
