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
namespace Plexus.Logging.CommonLogging
{
#if NETSTANDARD2_0
    using Microsoft.Extensions.Logging;
#endif
    using System;
    using System.Runtime.CompilerServices;
    using ICommonLogger = Common.Logging.ILog;
    using ILogger = ILogger;
    using LogLevel = LogLevel;

    internal sealed class Logger : ILogger
#if NETSTANDARD2_0
        , Microsoft.Extensions.Logging.ILogger
#endif
    {
        private static readonly object[] EmptyArgs = new object[0];

        public Logger(ICommonLogger logger, string name)
        {
            _logger = logger;
            Name = name;
        }

        private readonly ICommonLogger _logger;

        public string Name { get; }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public bool IsLogLevelEnabled(LogLevel level)
        {
            switch (level)
            {
                case LogLevel.All:
                    return _logger.IsTraceEnabled;
                case LogLevel.Trace:
                    return _logger.IsTraceEnabled;
                case LogLevel.Debug:
                    return _logger.IsDebugEnabled;
                case LogLevel.Info:
                    return _logger.IsInfoEnabled;
                case LogLevel.Warn:
                    return _logger.IsWarnEnabled;
                case LogLevel.Error:
                    return _logger.IsErrorEnabled;
                case LogLevel.Fatal:
                    return _logger.IsFatalEnabled;
                case LogLevel.Off:
                    return false;
                default:
                    throw new ArgumentOutOfRangeException(nameof(level), level, null);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log(LogLevel logLevel, Exception exception, string message)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                LogInternal(logLevel, exception, message, EmptyArgs);
            }
        }        

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1>(LogLevel logLevel, Exception exception, string message, T1 arg1)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                LogInternal(logLevel, exception, message, arg1);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                LogInternal(logLevel, exception, message, arg1, arg2);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                LogInternal(logLevel, exception, message, arg1, arg2, arg3);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                LogInternal(logLevel, exception, message, arg1, arg2, arg3, arg4);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4, T5>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                LogInternal(logLevel, exception, message, arg1, arg2, arg3, arg4, arg5);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<T1, T2, T3, T4, T5, T6>(LogLevel logLevel, Exception exception, string message, T1 arg1, T2 arg2, T3 arg3, T4 arg4, T5 arg5, T6 arg6)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                LogInternal(logLevel, exception, message, arg1, arg2, arg3, arg4, arg5, arg6);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log(LogLevel logLevel, Exception exception, string message, params object[] args)
        {
            LogInternal(logLevel, exception, message, args);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private void LogInternal(LogLevel logLevel, Exception exception, string message, params object[] args)
        {
            if (IsLogLevelEnabled(logLevel))
            {
                switch (logLevel)
                {
                    case LogLevel.All:
                        _logger.TraceFormat(message, exception, args);
                        break;
                    case LogLevel.Trace:
                        _logger.TraceFormat(message, exception, args);
                        break;
                    case LogLevel.Debug:
                        _logger.DebugFormat(message, exception, args);
                        break;
                    case LogLevel.Info:
                        _logger.InfoFormat(message, exception, args);
                        break;
                    case LogLevel.Warn:
                        _logger.WarnFormat(message, exception, args);
                        break;
                    case LogLevel.Error:
                        _logger.ErrorFormat(message, exception, args);
                        break;
                    case LogLevel.Fatal:
                        _logger.FatalFormat(message, exception, args);
                        break;
                    case LogLevel.Off:
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(logLevel), logLevel, null);
                }
            }
        }
#if NETSTANDARD2_0

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public void Log<TState>(Microsoft.Extensions.Logging.LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
        {
            var lvl = Convert(logLevel);
            if (IsLogLevelEnabled(lvl))
            {
                Log(lvl, exception, formatter(default(TState), exception));
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public bool IsEnabled(Microsoft.Extensions.Logging.LogLevel logLevel)
        {
            return IsLogLevelEnabled(Convert(logLevel));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public IDisposable BeginScope<TState>(TState state)
        {
            // Empty implementation as Common.Logging does not support scoping
            return EmptyScope.Instance;
        }        

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private LogLevel Convert(Microsoft.Extensions.Logging.LogLevel msLogLevel)
        {
            switch (msLogLevel)
            {
                case Microsoft.Extensions.Logging.LogLevel.Trace:
                    return LogLevel.Trace;
                case Microsoft.Extensions.Logging.LogLevel.Debug:
                    return LogLevel.Debug;
                case Microsoft.Extensions.Logging.LogLevel.Information:
                    return LogLevel.Info;
                case Microsoft.Extensions.Logging.LogLevel.Warning:
                    return LogLevel.Warn;
                case Microsoft.Extensions.Logging.LogLevel.Error:
                    return LogLevel.Error;
                case Microsoft.Extensions.Logging.LogLevel.Critical:
                    return LogLevel.Fatal;
                case Microsoft.Extensions.Logging.LogLevel.None:
                    return LogLevel.Off;
                default:
                    throw new ArgumentOutOfRangeException(nameof(msLogLevel), msLogLevel, null);
            }
        }
        
        private class EmptyScope : IDisposable
        {
            public static readonly EmptyScope Instance = new EmptyScope();

            public void Dispose()
            {
            }
        }
#endif
    }
}