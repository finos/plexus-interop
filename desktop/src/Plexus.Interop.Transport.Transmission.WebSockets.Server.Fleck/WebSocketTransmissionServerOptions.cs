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
namespace Plexus.Interop.Transport.Transmission.WebSockets.Server.Fleck
{
    using System.Collections.Generic;
    using System.Linq;

    public sealed class WebSocketTransmissionServerOptions
    {
        public WebSocketTransmissionServerOptions(
            string workingDir,
            uint port = 0, 
            IReadOnlyDictionary<string, string> staticFileMappings = null)
        {
            WorkingDir = workingDir;
            Port = port;
            StaticFileMappings = staticFileMappings != null
                ? staticFileMappings.ToDictionary(x => x.Key, y => y.Value)
                : new Dictionary<string, string>();
        }

        public string WorkingDir { get; }

        public uint Port { get; }

        public IReadOnlyDictionary<string, string> StaticFileMappings { get; }
    }
}
