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

    public sealed class TestBroker : StartableBase
    {
        private static readonly ILogger Log = LogManager.GetLogger<TestBroker>();

        private static readonly string RuntimeIdentifier =
#if NET452
            "win-x86";
#else
            RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "win-x86" : "osx-x64";
#endif

        private readonly string _exePath =
            Path.GetFullPath(Path.Combine(
                Directory.GetCurrentDirectory(), "..", "..", "..", "..", "..", "..", "bin", RuntimeIdentifier, "broker",
                "plexus"));

        private readonly string _workingDir;
        private readonly Promise _completion = new Promise();
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
#if NET452
            _process.StartInfo.EnvironmentVariables["PLEXUS_PARENT_PROCESS"] = Process.GetCurrentProcess().Id.ToString();            
#else            
            _process.StartInfo.Environment["PLEXUS_PARENT_PROCESS"] = Process.GetCurrentProcess().Id.ToString();
#endif
            _process.Exited += (x, y) =>
            {
                if (_process.ExitCode != 0)
                {
                    _completion.TryFail(
                        new InvalidOperationException(
                            $"Broker process exited with non-zero exit code {_process.ExitCode}"));
                }
                else
                {
                    _completion.TryComplete();
                }
            };
        }

        protected override Task<Task> StartProcessAsync(CancellationToken stopCancellationToken)
        {
            Log.Info("Starting test broker in directory {0}", _workingDir);
            if (!_process.Start())
            {
                throw new InvalidOperationException("Broker failed to start");
            }
            Log.Info("Test broker started in directory {0}", _workingDir);
            return Task.FromResult(RunBrokerAsync(stopCancellationToken));
        }

        private async Task RunBrokerAsync(CancellationToken cancellationToken)
        {
            using (cancellationToken.Register(OnStop))
            {
                await _completion.Task.ConfigureAwait(false);
                Log.Info("Stopped");
            }
        }

        private void OnStop()
        {
            Log.Info("Stopping");
            var shutdownEventName = "plexus-host-shutdown-" + _process.Id;
            Log.Info("Signalling broker process to shutdown: {0}", shutdownEventName);
            var shutdownEvent = new EventWaitHandle(
                false,
                EventResetMode.AutoReset,
                shutdownEventName);
            shutdownEvent.Set();
            _completion.Task.ContinueWithSynchronously(_ => shutdownEvent.Dispose());
            var timeout = TimeSpan.FromSeconds(5);
            Task.Delay(timeout).ContinueWithSynchronously(t =>
            {
                if (!_process.HasExited)
                {
                    Log.Warn("Killing broker forcibly after {0}sec shutdown awaiting", timeout.TotalSeconds);
                    _process.Kill();
                }
            });
        }
    }
}
