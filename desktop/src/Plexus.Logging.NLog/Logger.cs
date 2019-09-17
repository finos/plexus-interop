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
namespace Plexus.Logging.NLog
{
    using System;
    using System.Runtime.CompilerServices;
    using INLogLogger = global::NLog.ILogger;
    using NLogLevel = global::NLog.LogLevel;

    internal sealed class Logger : ILogger
    {
        private static readonly object[] EmptyArgs = new object[0];

        public Logger(INLogLogger logger)
        {
            _logger = logger;
        }

        private readonly INLogLogger _logger;

        public string Name => _logger.Name;

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public bool IsLogLevelEnabled(LogLevel level)
        {
            return _logger.IsEnabled(ConvertLevel(level));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log(LogLevel logLevel, Exception exception, string message)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {                
                _logger.Log(level, exception, message, EmptyArgs);
            }
        }        

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1>(LogLevel logLevel, Exception exception, string message, T1 arg1)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {                
                _logger.Log(level, exception, message, arg1);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {
                _logger.Log(level, exception, message, arg1, arg2);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {
                _logger.Log(level, exception, message, arg1, arg2, arg3);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {
                _logger.Log(level, exception, message, arg1, arg2, arg3, arg4);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4, T5>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {
                _logger.Log(level, exception, message, arg1, arg2, arg3, arg4, arg5);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4, T5, T6>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {
                _logger.Log(level, exception, message, arg1, arg2, arg3, arg4, arg5, arg6);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log(LogLevel logLevel, Exception exception, string message, params object[] args)
        {
            var level = ConvertLevel(logLevel);
            if (_logger.IsEnabled(level))
            {
                _logger.Log(level, exception, message, args);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static NLogLevel ConvertLevel(LogLevel level)
        {
            switch (level)
            {
                case LogLevel.All:
                    return NLogLevel.Trace;
                case LogLevel.Trace:
                    return NLogLevel.Trace;
                case LogLevel.Debug:
                    return NLogLevel.Debug;
                case LogLevel.Info:
                    return NLogLevel.Info;
                case LogLevel.Warn:
                    return NLogLevel.Warn;
                case LogLevel.Error:
                    return NLogLevel.Error;
                case LogLevel.Fatal:
                    return NLogLevel.Fatal;
                case LogLevel.Off:
                    return NLogLevel.Off;
                default:
                    throw new ArgumentOutOfRangeException(nameof(level), level, null);
            }
        }
    }
}
