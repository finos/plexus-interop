namespace Plexus.Host
{
    using Plexus.Logging.NLog;
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class ModuleLoader
    {
        private static readonly TimeSpan ShutdownTimeout = TimeSpan.FromSeconds(5);

        private static readonly IReadOnlyDictionary<string, string> ModuleAliases = new Dictionary<string, string>
        {
            { "broker", "Plexus.Interop.Broker.Host.dll"}
        };

        private readonly string[] _args;
        private readonly LoggingInitializer _loggingInitializer;
        private readonly ILogger _log;
        private IProgram _program;
        private int _isShuttingDown;

        public ModuleLoader(IEnumerable<string> args)
        {
            _args = args.ToArray();
            _loggingInitializer = new LoggingInitializer();
            _log = LogManager.GetLogger<ModuleLoader>();
        }

        public async Task<int> LoadAndRunAsync()
        {
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

            var firstArg = _args.First();
            var otherArgs = _args.Skip(1).ToArray();
            var programToLoad = firstArg;
            if (ModuleAliases.TryGetValue(programToLoad, out var alias))
            {
                programToLoad = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location),
                    alias);
            }
            var assembly = Assembly.LoadFrom(programToLoad);
            var attribute =
                (EntryPointAttribute) assembly.GetCustomAttributes(typeof(EntryPointAttribute)).SingleOrDefault();
            var programType = attribute != null
                ? attribute.Type
                : assembly.GetExportedTypes()
                    .SingleOrDefault(x => typeof(IProgram).IsAssignableFrom(x) && x.IsClass);
            _log.Info("Starting {0} with args: {1}", programType, string.Join(" ", otherArgs));
            try
            {
                _program = (IProgram) Activator.CreateInstance(programType);
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

    }
}
