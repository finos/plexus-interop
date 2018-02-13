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
    using System;
    using System.Runtime.CompilerServices;

    public static class LogManager
    {
#if NETSTANDARD1_6
        public static void ConfigureLogging(Microsoft.Extensions.Logging.ILoggerFactory loggerFactory)
        {
            LogConfig.LoggerFactory.Configure(loggerFactory);
        }
#endif

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ILogger GetLogger(string name)
        {
            return LogConfig.LoggerFactory.Create(name);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ILogger GetLogger(string name, string id)
        {
            return LogConfig.LoggerFactory.Create(name + "." + id);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ILogger GetLogger(Type type, string id)
        {
            return GetLogger(type.FormatName() + "." + id);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ILogger GetLogger(Type type)
        {
            return GetLogger(type.FormatName());
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ILogger GetLogger<T>()
        {
            return GetLogger(typeof(T).FormatName());
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static ILogger GetLogger<T>(string id)
        {
            return GetLogger(typeof(T).FormatName() + "." + id);
        }
    }
}
