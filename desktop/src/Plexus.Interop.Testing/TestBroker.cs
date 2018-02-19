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
﻿namespace Plexus.Interop.Testing
{
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Runtime.InteropServices;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Processes;
    using Process = System.Diagnostics.Process;

    public sealed class TestBroker : ProcessBase
    {
        private static readonly TimeSpan StopTimeout = TimeSpan.FromSeconds(3);

        private static readonly string RuntimeIdentifier =
#if NET45
            "win-x86";
#else
            RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "win-x86" : "osx-x64";
#endif

        private readonly string _exePath =
            Path.GetFullPath(Path.Combine(
                Directory.GetCurrentDirectory(), "..", "..", "..", "..", "..", "..", "bin", RuntimeIdentifier, "broker",
                "plexus"));

        private readonly string _workingDir;
        private readonly Promise _processExited = new Promise();
        private readonly Process _process;

        public TestBroker(string workingDir = null)
        {
            _workingDir = Path.GetFullPath(workingDir ?? Path.Combine(Directory.GetCurrentDirectory(), "TestBroker"));
            _process = new Process
            {
                StartInfo = new ProcessStartInfo(_exePath)
                {
                    WorkingDirectory = _workingDir,
                    Arguments = "broker metadata",
                    RedirectStandardOutput = false,
                    RedirectStandardInput = false,
                    RedirectStandardError = false,
                    CreateNoWindow = true,
                    UseShellExecute = false,
                },
                EnableRaisingEvents = true,
            };
#if NET45
            _process.StartInfo.EnvironmentVariables[EnvironmentHelper.ParentProcessIdVarName] = Process.GetCurrentProcess().Id.ToString();            
#else            
            _process.StartInfo.Environment[EnvironmentHelper.ParentProcessIdVarName] = Process.GetCurrentProcess().Id.ToString();
#endif
            _process.Exited += (x, y) =>
            {
                if (_process.ExitCode != 0)
                {
                    _processExited.TryFail(
                        new InvalidOperationException(
                            $"Broker process exited with non-zero exit code {_process.ExitCode}"));
                }
                else
                {
                    _processExited.TryComplete();
                }
            };

            OnStop(SendShutdownEvent);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<TestBroker>();

        protected override Task<Task> StartCoreAsync()
        {
            Log.Info("Starting test broker in directory {0}", _workingDir);
            if (!_process.Start())
            {
                throw new InvalidOperationException("Broker failed to start");
            }
            Log.Info("Test broker started in directory {0}", _workingDir);
            return Task.FromResult(_processExited.Task);
        }

        private void SendShutdownEvent()
        {
            Log.Info("Stopping");
            var shutdownEventName = "plexus-host-shutdown-" + _process.Id;
            Log.Info("Signalling broker process to shutdown: {0}", shutdownEventName);
            var shutdownEvent = new EventWaitHandle(
                false,
                EventResetMode.AutoReset,
                shutdownEventName);
            shutdownEvent.Set();
            _processExited.Task.ContinueWithSynchronously(_ => shutdownEvent.Dispose());
            Task.Delay(StopTimeout).ContinueWithSynchronously(t =>
            {
                if (!_process.HasExited)
                {
                    Log.Warn("Killing broker forcibly after {0}sec shutdown awaiting", StopTimeout.TotalSeconds);
                    _process.Kill();
                }
            });
        }
    }
}
