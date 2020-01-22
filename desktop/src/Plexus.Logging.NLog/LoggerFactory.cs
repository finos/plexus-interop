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
namespace Plexus.Logging.NLog
{
    using global::NLog.Config;
    using System;
    using System.IO;
    using System.Runtime.CompilerServices;
    using System.Threading.Tasks;
    using NLogManager = global::NLog.LogManager;
#if NETSTANDARD2_0
    using global::NLog.Extensions.Logging;
#endif

    internal sealed class LoggerFactory : ILoggerFactory
    {
        public LoggerFactory()
        {
            if (!TryLoadFromWorkDir("Nlog.config"))
            {
                TryLoadFromWorkDir("nlog.config");
            }
        }

        private static bool TryLoadFromWorkDir(string fileName)
        {
            var pathToCheck = Path.Combine(Directory.GetCurrentDirectory(), fileName);
            if (File.Exists(pathToCheck))
            {
                NLogManager.Configuration = new XmlLoggingConfiguration(pathToCheck);
                NLogManager.ReconfigExistingLoggers();
                return true;
            }
            return false;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public ILogger Create(string name)
        {
            return new Logger(NLogManager.GetLogger(name));
        }

#if NETSTANDARD2_0
        public void Configure(Microsoft.Extensions.Logging.ILoggerFactory loggerFactory)
        {
            loggerFactory.AddNLog();
        }
#endif

        public Task FlushAsync(TimeSpan timeout)
        {
            var tcs = new TaskCompletionSource<object>();
            NLogManager.Flush(
                e =>
                {
                    if (e != null)
                    {
                        tcs.TrySetException(e);
                    }
                    else
                    {
                        tcs.TrySetResult(null);
                    }
                },
                timeout);
            return tcs.Task;
        }

        public void Flush(TimeSpan timeout)
        {
            NLogManager.Flush(timeout);
        }

        public void Flush()
        {
            NLogManager.Flush();
        }
    }
}
