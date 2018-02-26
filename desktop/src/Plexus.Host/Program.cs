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
namespace Plexus.Host
{
    using System;
    using System.Collections.Generic;
    using System.CommandLine;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class Program
    {
        private static readonly TimeSpan ShutdownTimeout = TimeoutConstants.Timeout5Sec;

        public static int Main(string[] args)
        {
            InitializeProcess();
            AppDomain.CurrentDomain.AssemblyResolve += OnAssemblyResolve;
            return new Program().RunAsync(args).GetResult();
        }

        public async Task<int> RunAsync(string[] args)
        {
            var command = CliCommand.None;
            var workingDir = Directory.GetCurrentDirectory();
            var metadataDir = "metadata";
            string pluginPath = null;
            IReadOnlyList<string> pluginArgs = new string[0];
            IReadOnlyList<string> appIds = new string[0];
            string pid = null;

            try
            {                
                var result = ArgumentSyntax.Parse(args, syntax =>
                {
                    syntax.ApplicationName = "plexus";
                    syntax.ErrorOnUnexpectedArguments = false;
                    syntax.HandleHelp = true;
                    syntax.HandleErrors = true;
                    syntax.HandleResponseFiles = true;

                    syntax.DefineCommand("broker", ref command, CliCommand.Broker, "Start interop broker");
                    syntax.DefineOption(
                        "d|directory",
                        ref workingDir,
                        false,
                        "Working directory for interop broker");
                    syntax.DefineOption(
                        "m|metadata",
                        ref metadataDir,
                        false,
                        "Directory to seek for metadata files: apps.json and interop.json");

                    syntax.DefineCommand("activate", ref command, CliCommand.Activate, "Activate app in the running broker");
                    syntax.DefineOption(
                        "d|directory",
                        ref workingDir,
                        false,
                        "Working directory for interop broker");
                    syntax.DefineParameterList("application", ref appIds, "Application IDs");

                    var loadCommand = syntax.DefineCommand("load", ref command, CliCommand.Load, "Load plugin dll");
                    loadCommand.IsHidden = true;
                    syntax.DefineOption(
                        "p|plugin",
                        ref pluginPath,
                        true,
                        "Path to plugin");
                    syntax.DefineOption(
                        "d|directory",
                        ref workingDir,
                        false,
                        "Working directory for plugin process");
                    syntax.DefineParameterList("pluginCmd", ref pluginArgs, "Plugin arguments");

                    var stopCommand = syntax.DefineCommand("stop", ref command, CliCommand.Stop, "Stop currently running plexus process(es)");
                    stopCommand.IsHidden = true;
                    syntax.DefineParameter("pid", ref pid, "Process ID to stop");
                });

                switch (command)
                {
                    case CliCommand.None:
                        result.ReportError("<command> required");
                        return 1;
                    case CliCommand.Broker:
                        return await StartBrokerAsync(workingDir, metadataDir).ConfigureAwait(false);
                    case CliCommand.Stop:
                        return await StopProcess(pid).ConfigureAwait(false);
                    case CliCommand.Load:
                        if (string.IsNullOrEmpty(pluginPath))
                        {
                            result.ReportError("<plugin> option required");
                            return 1;
                        }
                        return await LoadAndRunProgramAsync(pluginPath, pluginArgs, workingDir);
                    case CliCommand.Activate:
                        if (appIds.Count == 0)
                        {
                            result.ReportError("At least one <application> must be specified");
                            return 1;
                        }
                        return await ActivateAppAsync(workingDir, appIds);
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Unhandled exception: " + ex);
                return 1;
            }
        }

        private static async Task<int> LoadAndRunProgramAsync(
            string programPath,
            IEnumerable<string> programArgs,
            string workingDir)
        {
            using (var loader = new ProgramLoader(programPath, programArgs, workingDir))
            {
                return await loader.LoadAndRunAsync().ConfigureAwait(false);
            }
        }

        private static async Task<int> ActivateAppAsync(string workingDir, IEnumerable<string> appIds)
        {
            var commandLineToolPluginPath = Path.Combine(
                Path.GetDirectoryName(typeof(Program).Assembly.Location),
                "Plexus.Interop.CommandLineTool.dll");
            var args = new List<string> {"activate"};
            args.AddRange(appIds);
            return await LoadAndRunProgramAsync(commandLineToolPluginPath, args, workingDir).ConfigureAwait(false);
        }

        private static async Task<int> StartBrokerAsync(string workingDir, string metadataDir)
        {
            var fullMetadataDir = Path.GetFullPath(metadataDir);
            var brokerPluginPath = Path.Combine(
                Path.GetDirectoryName(typeof(Program).Assembly.Location),
                "Plexus.Interop.Broker.Host.dll");
            var args = new List<string> { "start", "-m", fullMetadataDir };
            return await LoadAndRunProgramAsync(brokerPluginPath, args, workingDir).ConfigureAwait(false);
        }
        
        private static async Task<int> StopProcess(string pidArg)
        {
            var processes = Process.GetProcesses().Where(x =>
                string.Equals(x.ProcessName, "plexus") || string.Equals(x.ProcessName, "plexus.exe"));
            processes = processes.Where(x => x.Id != Process.GetCurrentProcess().Id);
            if (!string.IsNullOrEmpty(pidArg) && int.TryParse(pidArg, out var pid))
            {
                processes = processes.Where(x => x.Id == pid);
            }

            async Task ShutdownProcessAsync(Process process)
            {
                Console.WriteLine($"Shutting down plexus process {process.Id}");
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
                        Console.WriteLine($"Killing plexus process {process.Id} which failed to shutdown gracefully in the given timeout {ShutdownTimeout.TotalSeconds} sec");
                        process.Kill();
                    }
                }
                var exitCode = await exitPromise.Task.ConfigureAwait(false);
                Console.WriteLine($"Plexus process {process.Id} exited with code {exitCode}");
            }

            var tasks = processes.Select(x => TaskRunner.RunInBackground(() => ShutdownProcessAsync(x)));

            await Task.WhenAll(tasks).IgnoreExceptions().ConfigureAwait(false);

            return 0;
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
