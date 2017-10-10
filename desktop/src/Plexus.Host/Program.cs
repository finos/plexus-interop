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
﻿namespace Plexus.Host
{
    using Plexus.Logging.NLog;
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class Program : IProgram
    {
        private static readonly TimeSpan ShutdownTimeout = TimeSpan.FromSeconds(5);

        private static readonly IReadOnlyDictionary<string, string> ProgramAliases = new Dictionary<string, string>
        {
            { "broker", "Plexus.Interop.Broker.Host.dll"}
        };

        private static LoggingInitializer _loggingInitializer;
        private static ILogger _log;
        private IProgram _program;
        private int _isShuttingDown;

        public static async Task<int> Main(string[] args)
        {
            using (_loggingInitializer = new LoggingInitializer())
            {
                try
                {
                    InitializeProcess();
                    _log = LogManager.GetLogger<Program>();
                    AppDomain.CurrentDomain.AssemblyResolve += OnAssemblyResolve;
                    return await new Program().RunAsync(args).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _log.Error(ex, "Unhandled exception");
                    return 1;
                }
            }
        }

        public async Task<int> RunAsync(string[] args)
        {
            _log.Info("Executing {0}", Environment.CommandLine);

            var firstArg = args.First();
            var otherArgs = args.Skip(1).ToArray();

            if (string.Equals(firstArg, "start"))
            {
                return StartProcess(otherArgs);
            }

            if (string.Equals(firstArg, "stop"))
            {
                return await StopProcess(otherArgs).ConfigureAwait(false);
            }

            var parentProcessVar = Environment.GetEnvironmentVariable("PLEXUS_PARENT_PROCESS");
            if (!string.IsNullOrWhiteSpace(parentProcessVar) && int.TryParse(parentProcessVar, out var parentPid))
            {
                var parentProcess = Process.GetProcessById(parentPid);
                if (parentProcess != null)
                {
                    AttachToParent(parentProcess);
                }
            }

            RegisterShutdownEvent();

            var programToLoad = firstArg;
            if (ProgramAliases.TryGetValue(programToLoad, out var alias))
            {
                programToLoad = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), alias);
            }
            var assembly = Assembly.LoadFrom(programToLoad);
            var attribute =
                (EntryPointAttribute)assembly.GetCustomAttributes(typeof(EntryPointAttribute)).SingleOrDefault();
            var programType = attribute != null
                ? attribute.Type
                : assembly.GetExportedTypes()
                    .SingleOrDefault(x => typeof(IProgram).IsAssignableFrom(x) && x.IsClass);
            _log.Info("Starting {0} with args: {1}", programType, string.Join(" ", otherArgs));
            try
            {
                _program = (IProgram)Activator.CreateInstance(programType);
                var exitCode = await _program.RunAsync(otherArgs).ConfigureAwait(false);
                _log.Info("Program {0} exited with code {1}", programType, exitCode);
                return exitCode;
            }
            catch (Exception ex)
            {
                _log.Error(ex, "Unhandled exception in program {0}", programType);
                return 1;
            }
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

        private static void AttachToParent(Process parentProcess)
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

        private static int StartProcess(string[] otherArgs)
        {
            var argsJoined = string.Join(" ", otherArgs);
            var si = new ProcessStartInfo
            {
                FileName = "plexus",
                Arguments = argsJoined,
                WorkingDirectory = Directory.GetCurrentDirectory(),
                RedirectStandardOutput = false,
                RedirectStandardInput = false,
                RedirectStandardError = false,
                CreateNoWindow = true,
                UseShellExecute = false,
            };
            var p = Process.Start(si);
            _log.Info("Started process {0}: plexus {1}", p.Id, argsJoined);

            return 0;
        }

        private static async Task<int> StopProcess(string[] otherArgs)
        {
            var processes = Process.GetProcesses().Where(x =>
                string.Equals(x.ProcessName, "plexus") || string.Equals(x.ProcessName, "plexus.exe"));
            processes = processes.Where(x => x.Id != Process.GetCurrentProcess().Id);
            var pidArg = otherArgs.FirstOrDefault();
            if (!string.IsNullOrEmpty(pidArg) && int.TryParse(pidArg, out var pid))
            {
                processes = processes.Where(x => x.Id == pid);
            }

            async Task ShutdownProcessAsync(Process process)
            {
                _log.Info("Shutting down plexus process {0}", process.Id);
                process.EnableRaisingEvents = true;
                var exitPromise = new Promise<int>();
                process.Exited += (sender, eventArgs) => exitPromise.TryComplete(((Process) sender).ExitCode);
                if (process.HasExited)
                {
                    exitPromise.TryComplete(process.ExitCode);
                }
                else
                {
                    var evtName = "plexus-host-shutdown-" + process.Id;
                    var evt = new EventWaitHandle(false, EventResetMode.AutoReset, evtName);
                    evt.Set();
                    var completed = await Task.WhenAny(exitPromise.Task,
                        Task.Delay(ShutdownTimeout));
                    if (completed != exitPromise.Task)
                    {
                        _log.Warn("Process {0} failed to shutdown gracefully in the given timeout {1}", process.Id,
                            ShutdownTimeout);
                        process.Kill();
                    }
                }
                var exitCode = await exitPromise.Task.ConfigureAwait(false);
                _log.Info("Plexus process {0} exited with code {1}", process.Id, exitCode);
            }

            var tasks = processes.Select(x => TaskRunner.RunInBackground(() => ShutdownProcessAsync(x)));

            await Task.WhenAll(tasks).IgnoreExceptions().ConfigureAwait(false);

            return 0;
        }

        public async Task ShutdownAsync()
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

        private static Assembly OnAssemblyResolve(object sender, ResolveEventArgs args)
        {
            try
            {
                var baseDir = Path.GetDirectoryName(args.RequestingAssembly.Location);
                var path = Path.Combine(baseDir, new AssemblyName(args.Name).Name + ".dll");
                return File.Exists(path) ? Assembly.LoadFrom(path) : null;
            }
            catch
            {
                return null;
            }
        }

        private static void InitializeProcess()
        {
            // by default, .NET Core doesn't have all code pages needed for Console apps.
            // see the .NET Core Notes in https://msdn.microsoft.com/en-us/library/system.diagnostics.process(v=vs.110).aspx
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        }
    }
}
