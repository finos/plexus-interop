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
﻿namespace Plexus.Host.Internal
{
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Logging.NLog;

    internal sealed class ProgramLoader : IDisposable
    {        
        private static readonly TimeSpan ShutdownTimeout = TimeoutConstants.Timeout5Sec;

        private readonly LoggingInitializer _loggingInitializer;
        private readonly ILogger _log;
        private readonly IProgram _program;
        private int _isShuttingDown;

        public ProgramLoader(IProgram program)
        {
            _program = program;
            _loggingInitializer = new LoggingInitializer();
            _log = LogManager.GetLogger<ProgramLoader>();
        }

        public async Task<int> LoadAndRunAsync()
        {
            LockFile lockFile = null;
            try
            {
                _log.Info("Starting {0}", _program.Name);

                if (_program.InstanceAwareness == InstanceAwareness.SingleInstancePerDirectory)
                {
                    var workingDir = Directory.GetCurrentDirectory();
                    _log.Info("Checking if another instance of {0} is already running in directory {1}", 
                        _program.Name, workingDir);
                    var lockFileName = _program.InstanceKey + "-lock";                    
                    lockFile = new LockFile(lockFileName, Process.GetCurrentProcess().Id.ToString());
                    _log.Info("Trying to acquire lock file {0}", lockFile.Name);
                    var isFirstInstance = lockFile.TryEnter(500);
                    if (!isFirstInstance)
                    {
                        _log.Info("Another instance of {0} is already running in directory {1}. Exiting.",
                            _program.InstanceKey, workingDir);
                        return 1;
                    }
                }

                var parentProcessVar = Environment.GetEnvironmentVariable(EnvironmentHelper.ParentProcessIdVarName);
                if (!string.IsNullOrWhiteSpace(parentProcessVar) && int.TryParse(parentProcessVar, out var parentPid))
                {
                    var parentProcess = Process.GetProcessById(parentPid);
                    AttachToParent(parentProcess);
                }

                RegisterShutdownEvent();

                var task = await _program.StartAsync().ConfigureAwait(false);
                _log.Info("{0} started", _program.Name);
                await task.ConfigureAwait(false);
                _log.Info("{0} completed", _program.Name);
            }
            catch (Exception ex)
            {
                _log.Error(ex, "Unhandled exception while running {0}", _program.Name);
                return 1;
            }
            finally
            {
                if (lockFile != null)
                {
                    _log.Info("Releasing lock file {0}", lockFile.Name);
                    lockFile.Dispose();
                }
            }

            _log.Info("{0} completed successfully", _program.Name);
            return 0;
        }

        private void RegisterShutdownEvent()
        {
            Console.CancelKeyPress += (x, y) =>
            {
                ShutdownAsync().IgnoreAwait(_log);
                y.Cancel = true;
            };

            var shutdownEventName = "plexus-host-shutdown-" + Process.GetCurrentProcess().Id;
            _log.Debug("Registering shutdown event: {0}", shutdownEventName);
            var shutdownEvent = new EventWaitHandle(false, EventResetMode.AutoReset, shutdownEventName);
            ThreadPool.RegisterWaitForSingleObject(
                shutdownEvent,
                (state, timedOut) => ShutdownAsync().IgnoreAwait(_log),
                null,
                Timeout.Infinite,
                true);
        }

        private void AttachToParent(Process parentProcess)
        {
            _log.Info("Attaching the current process to the parent process \"{0}\" ({1})", parentProcess.ProcessName, parentProcess.Id);

            void OnParentProcessExited()
            {
                _log.Warn("Exiting because the attached parent process \"{0}\" ({1}) exited with code {2}", parentProcess.ProcessName, parentProcess.Id, parentProcess.ExitCode);
                _loggingInitializer?.Dispose();
                Environment.Exit(1);
            }
            parentProcess.EnableRaisingEvents = true;
            parentProcess.Exited += (sender, args) =>
            {
                OnParentProcessExited();
            };
            if (parentProcess.HasExited)
            {
                OnParentProcessExited();
            }
        }

        private async Task ShutdownAsync()
        {
            if (Interlocked.Exchange(ref _isShuttingDown, 1) == 1)
            {
                return;
            }
            if (_program == null)
            {
                _loggingInitializer?.Dispose();
                Environment.Exit(0);
            }
            else
            {
                _log.Info("Shutting down");

                var task = TaskRunner.RunInBackground(_program.ShutdownAsync);

                var completed = await Task.WhenAny(task, Task.Delay(ShutdownTimeout)).ConfigureAwait(false);
                if (completed != task)
                {
                    _log.Error("Program {0} failed to shutdown gracefully withing the given timeout {1} sec", _program.GetType(), ShutdownTimeout.TotalSeconds);
                    _loggingInitializer?.Dispose();
                    Environment.Exit(1);
                }
                if (task.IsFaulted)
                {
                    _log.Error(task.Exception.ExtractInner(), "Exception while shutting down program {0}", _program.GetType());
                    _loggingInitializer?.Dispose();
                    Environment.Exit(1);
                }
            }
        }

        public void Dispose()
        {
            _loggingInitializer?.Dispose();
        }
    }
}
