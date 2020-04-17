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
namespace Plexus.Host.Internal
{
    using CommandLine;
    using CommandLine.Text;

#if NET45
    internal sealed class VerbOptions
    {
        [HelpVerbOption]
        public string DoHelpForVerb(string verbName)
        {
            return HelpText.AutoBuild(this,
                current => HelpText.DefaultParsingErrorsHandler(this, current),
                true);
        }

        [VerbOption("start", HelpText = "Start interop broker.")]
        public StartCliOptions StartVerb { get; set; }

        [VerbOption("broker", HelpText = "Start interop broker.")]
        public BrokerCliOptions BrokerVerb { get; set; }

        [VerbOption("launch", HelpText = "Launch interop application.")]
        public LaunchCliOptions LaunchCliVerb { get; set; }
 
        [VerbOption("stop", HelpText = "Stop interop broker.")]
        public StopCliOptions StopVerb { get; set; }

        [VerbOption("studio", HelpText = "Start Plexus Studio.")]
        public StudioCliOptions StudioVerb { get; set; }
    }
#endif
}
