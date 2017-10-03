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
using System.Runtime.CompilerServices;
using JetBrains.Annotations;

namespace Plexus
{
    public static partial class LoggerExtensions
    {
        /// <summary>
        /// Returns bool indicating whether the specified <see cref="LogLevel.Trace"/> is enabled.
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static bool IsTraceEnabled(this ILogger logger)
        {
            return logger.IsLogLevelEnabled(LogLevel.Trace);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="exception">The exception to log.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace(this ILogger logger, [CanBeNull] Exception exception, string message)
        {
            logger.Log(LogLevel.Trace, exception, message);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="exception">The exception to log.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1>(this ILogger logger, [CanBeNull] Exception exception, string message, T1 arg1)
        {
            logger.Log(LogLevel.Trace, exception, message, arg1);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="exception">The exception to log.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2>(this ILogger logger, [CanBeNull] Exception exception, string message, T1 arg1, T2 arg2)
        {
            logger.Log(LogLevel.Trace, exception, message, arg1, arg2);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="exception">The exception to log.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2, T3>(this ILogger logger, [CanBeNull] Exception exception, string message, T1 arg1, T2 arg2, T3 arg3)
        {
            logger.Log(LogLevel.Trace, exception, message, arg1, arg2, arg3);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="exception">The exception to log.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        /// <param name="arg4">The fourth argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2, T3, T4>(this ILogger logger, [CanBeNull] Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
        {
            logger.Log(LogLevel.Trace, exception, message, arg1, arg2, arg3, arg4);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="exception">The exception to log.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        /// <param name="arg4">The fourth argument for message formatting.</param>
        /// <param name="arg5">The fifth argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2, T3, T4, T5>(this ILogger logger, [CanBeNull] Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
        {
            logger.Log(LogLevel.Trace, exception, message, arg1, arg2, arg3, arg4, arg5);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="exception">The exception to log.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="args">Arguments for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace(this ILogger logger, [CanBeNull] Exception exception, string message, params object[] args)
        {
            logger.Log(LogLevel.Trace, exception, message, args);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace(this ILogger logger, string message)
        {
            logger.Log(LogLevel.Trace, null, message);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1>(this ILogger logger, string message, T1 arg1)
        {
            logger.Log(LogLevel.Trace, null, message, arg1);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2>(this ILogger logger, string message, T1 arg1, T2 arg2)
        {
            logger.Log(LogLevel.Trace, null, message, arg1, arg2);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2, T3>(this ILogger logger, string message, T1 arg1, T2 arg2, T3 arg3)
        {
            logger.Log(LogLevel.Trace, null, message, arg1, arg2, arg3);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        /// <param name="arg4">The fourth argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2, T3, T4>(this ILogger logger, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
        {
            logger.Log(LogLevel.Trace, null, message, arg1, arg2, arg3, arg4);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        /// <param name="arg4">The fourth argument for message formatting.</param>
        /// <param name="arg5">The fifth argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace<T1, T2, T3, T4, T5>(this ILogger logger, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
        {
            logger.Log(LogLevel.Trace, null, message, arg1, arg2, arg3, arg4, arg5);
        }

        /// <summary>
        /// Log a message with level <see cref="LogLevel.Trace"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="args">Arguments for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Trace(this ILogger logger, string message, params object[] args)
        {
            logger.Log(LogLevel.Trace, null, message, args);
        }
    }
}
