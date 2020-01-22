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
﻿using System.Runtime.CompilerServices;
using JetBrains.Annotations;

namespace Plexus
{
    public static partial class LoggerExtensions
    {
        /// <summary>
        /// Log a message with the specified <paramref name="logLevel"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="logLevel">The level of log entry.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Log(this ILogger logger, LogLevel logLevel, string message)
        {
            logger.Log(logLevel, null, message);
        }

        /// <summary>
        /// Log a message with the specified <paramref name="logLevel"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="logLevel">The level of log entry.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Log<T1>(this ILogger logger, LogLevel logLevel, string message, T1 arg1)
        {
            logger.Log(logLevel, null, message, arg1);
        }

        /// <summary>
        /// Log a message with the specified <paramref name="logLevel"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="logLevel">The level of log entry.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Log<T1, T2>(this ILogger logger, LogLevel logLevel, string message, T1 arg1, T2 arg2)
        {
            logger.Log(logLevel, null, message, arg1, arg2);
        }

        /// <summary>
        /// Log a message with the specified <paramref name="logLevel"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="logLevel">The level of log entry.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Log<T1, T2, T3>(this ILogger logger, LogLevel logLevel, string message, T1 arg1, T2 arg2, T3 arg3)
        {
            logger.Log(logLevel, null, message, arg1, arg2, arg3);
        }

        /// <summary>
        /// Log a message with the specified <paramref name="logLevel"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="logLevel">The level of log entry.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        /// <param name="arg4">The fourth argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Log<T1, T2, T3, T4>(this ILogger logger, LogLevel logLevel, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
        {
            logger.Log(logLevel, null, message, arg1, arg2, arg3, arg4);
        }

        /// <summary>
        /// Log a message with the specified <paramref name="logLevel"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="logLevel">The level of log entry.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="arg1">The first argument for message formatting.</param>
        /// <param name="arg2">The second argument for message formatting.</param>
        /// <param name="arg3">The third argument for message formatting.</param>
        /// <param name="arg4">The fourth argument for message formatting.</param>
        /// <param name="arg5">The fifth argument for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Log<T1, T2, T3, T4, T5>(this ILogger logger, LogLevel logLevel, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
        {
            logger.Log(logLevel, null, message, arg1, arg2, arg3, arg4, arg5);
        }

        /// <summary>
        /// Log a message with the specified <paramref name="logLevel"/>.
        /// </summary>
        /// <param name="logger">The logger.</param>
        /// <param name="logLevel">The level of log entry.</param>
        /// <param name="message">The format of the message object to log.<see cref="string.Format(string,object[])"/> </param>
        /// <param name="args">Arguments for message formatting.</param>
        [StringFormatMethod("message")]
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void Log(this ILogger logger, LogLevel logLevel, string message, params object[] args)
        {
            logger.Log(logLevel, null, message, args);
        }
    }
}
