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
﻿namespace Plexus.Interop.CommandLineTool.Internal
{
    using System.Collections.Generic;
    using System.CommandLine;

    internal sealed class CommandLineToolArguments
    {
        public static CommandLineToolArguments Parse(string[] args)
        {
            var command = CommandLineToolCommand.None;
            IReadOnlyList<string> appIds = new string[0];
            ArgumentSyntax.Parse(args, syntax =>
            {
                syntax.ApplicationName = "Plexus.Interop.CommandLineTool";
                syntax.ErrorOnUnexpectedArguments = true;
                syntax.HandleHelp = false;
                syntax.HandleErrors = false;
                syntax.HandleResponseFiles = false;

                syntax.DefineCommand("launch", ref command, CommandLineToolCommand.LaunchApp, "Launch application(s)");
                syntax.DefineParameterList("application", ref appIds, "Application IDs");
            });
            return new CommandLineToolArguments
            {
                Command = command,
                ApplicationIds = appIds,
            };
        }

        private CommandLineToolArguments()
        {
        }

        public CommandLineToolCommand Command { get; private set; }

        public IReadOnlyList<string> ApplicationIds { get; private set; }
    }
}
