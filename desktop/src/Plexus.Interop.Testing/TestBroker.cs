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
namespace Plexus.Interop.Testing
{
    using Plexus.Processes;
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Runtime.InteropServices;
    using System.Threading;
    using System.Threading.Tasks;
    using Process = System.Diagnostics.Process;

    internal sealed class TestBroker : ProcessBase, ITestBroker
    {
        private static readonly TimeSpan StopTimeout = TimeoutConstants.Timeout3Sec;

        private const string ArtifactsDir =
#if CORE_ONLY
"netcoreapp2.1-x64";
#else
"net45-AnyCPU";
#endif
        private readonly string _exePath =
            Path.GetFullPath(Path.Combine(
                Directory.GetCurrentDirectory(), "..", "..", "..", "..", "..", "..", "bin", ArtifactsDir, "broker",
                "plexus"));
        
        private readonly Promise _processExited = new Promise();
        private readonly Process _process;

        public TestBroker(string id)
        {
            var testBrokerConfigDir = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "TestBrokerConfig"));
            WorkingDir = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "TestBroker", id));
            FileSystemUtils.DeleteDir(WorkingDir);
            FileSystemUtils.CopyDir(testBrokerConfigDir, WorkingDir);
            _process = new Process
            {
                StartInfo = new ProcessStartInfo(_exePath)
                {
                    WorkingDirectory = WorkingDir,
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
            var processEnv = _process.StartInfo.EnvironmentVariables;
#else
            var processEnv = _process.StartInfo.Environment;
#endif
            processEnv[EnvironmentHelper.ParentProcessIdVarName] = Process.GetCurrentProcess().Id.ToString();
            processEnv[EnvironmentHelper.LauncherId] = TestAppLauncher.LauncherAppInstanceId.ToString();
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

        public string WorkingDir { get; }

        protected override ILogger Log { get; } = LogManager.GetLogger<TestBroker>();

        protected override Task<Task> StartCoreAsync()
        {
            Log.Info("Starting test broker in directory {0}", WorkingDir);
            if (!_process.Start())
            {
                throw new InvalidOperationException("Broker failed to start");
            }
            Log.Info("Test broker started in directory {0}", WorkingDir);
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
