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
﻿namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Diagnostics;
    using System.IO;

    internal sealed class SubProcessLauncher
    {
        private static readonly ILogger Log = LogManager.GetLogger<SubProcessLauncher>();

        private readonly string _curPid = Process.GetCurrentProcess().Id.ToString();

        public UniqueId Launch(string cmd, string args, string workingDir = null)
        {
            Log.Debug("Launching process: {0} {1}", cmd, args);
            cmd = Path.GetFullPath(cmd);
            workingDir = workingDir ?? Path.GetDirectoryName(cmd);            
            var process = new Process
            {
                StartInfo = new ProcessStartInfo(cmd)
                {
                    WorkingDirectory = workingDir,
                    Arguments = args,
                    RedirectStandardOutput = false,
                    RedirectStandardInput = false,                    
                    RedirectStandardError = false,                    
                    CreateNoWindow = true,
                    UseShellExecute = false,
                }
            };

            var appInstanceId = UniqueId.Generate();

#if NETSTANDARD1_6
            process.StartInfo.Environment["PLEXUS_PARENT_PROCESS"] = _curPid;
            process.StartInfo.Environment["PLEXUS_BROKER_WORKING_DIR"] = Directory.GetCurrentDirectory();
            process.StartInfo.Environment["PLEXUS_APP_INSTANCE_ID"] = appInstanceId.ToString();
#else
            process.StartInfo.EnvironmentVariables["PLEXUS_PARENT_PROCESS"] = _curPid;
            process.StartInfo.EnvironmentVariables["PLEXUS_BROKER_WORKING_DIR"] = Directory.GetCurrentDirectory();
            process.StartInfo.EnvironmentVariables["PLEXUS_APP_INSTANCE_ID"] = appInstanceId.ToString();
#endif

            if (!process.Start())
            {
                throw new InvalidOperationException($"Process {cmd} failed to start");
            }

            return appInstanceId;
        }
    }
}
