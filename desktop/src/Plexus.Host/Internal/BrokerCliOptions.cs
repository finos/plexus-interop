/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Host.Internal
{
    using CommandLine;
    using CommandLine.Text;

#if NETCOREAPP2_2
    [Verb("start", HelpText = "Start interop broker.")]
#endif
    internal class StartCliOptions
    {
        [Option('m', "metadata", Required = false, HelpText = "Directory to seek for metadata files: apps.json and interop.json.")]
        public string Metadata { get; set; }

        [Option('p', "port", Required = false, HelpText = "Port number to listen. If omitted, free port is selected automatically.")]
        public uint Port { get; set; }
    }

#if NETCOREAPP2_2
    [Verb("broker", HelpText = "Start interop broker.")]
#endif
    internal class BrokerCliOptions : StartCliOptions
    {
    }
}
