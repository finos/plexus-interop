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
    using Common.Logging;    
    using ILogger = Plexus.ILogger;
    using ILoggerFactory = Plexus.ILoggerFactory;

    internal sealed class LoggerFactory : ILoggerFactory
#if NETSTANDARD2_0
        ,ILoggerProvider
#endif
    {
        public ILogger Create(string name)
        {
            return new Logger(LogManager.GetLogger(name), name);
        }

#if NETSTANDARD2_0
        public void Configure(Microsoft.Extensions.Logging.ILoggerFactory loggerFactory)
        {
            loggerFactory.AddProvider(this);
        }

        public void Dispose()
        {
        }

        public Microsoft.Extensions.Logging.ILogger CreateLogger(string categoryName)
        {
            return new Logger(LogManager.GetLogger(categoryName), categoryName);
        }
#endif
    }
}
