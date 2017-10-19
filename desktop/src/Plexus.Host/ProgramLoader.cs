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

    internal sealed class ProgramLoader : IDisposable
    {
        private static readonly TimeSpan ShutdownTimeout = TimeSpan.FromSeconds(5);

        private readonly string[] _args;
        private readonly LoggingInitializer _loggingInitializer;
        private readonly ILogger _log;
        private readonly string _path;
        private readonly string _workingDir;
        private IProgram _program;
        private int _isShuttingDown;

        public ProgramLoader(
            string path, 
            IEnumerable<string> args, 
            string workingDir)
        {
            _path = Path.GetFullPath(path);
            _workingDir = Path.GetFullPath(workingDir ?? Directory.GetCurrentDirectory());
            _args = args.ToArray();
            _loggingInitializer = new LoggingInitializer();
            _log = LogManager.GetLogger<ProgramLoader>();
        }

        public async Task<int> LoadAndRunAsync()
        {
            _log.Info("Loading {0} {1}", _path, string.Join(" ", _args));
            InstancePerDirectoryLock instancePerDirectoryLock = null;
            var curDir = Directory.GetCurrentDirectory();
            Directory.SetCurrentDirectory(_workingDir);
            try
            {
                var assembly = Assembly.LoadFrom(_path);
                var attribute =
                    (EntryPointAttribute) assembly.GetCustomAttributes(typeof(EntryPointAttribute)).SingleOrDefault();

                if (attribute == null)
                {
                    throw new InvalidOperationException(
                        $"Cannot find assembly attribute {typeof(EntryPointAttribute)} on assembly {_path}");
                }

                if (attribute.InstanceAwareness == InstanceAwareness.SingleInstancePerDirectory)
                {
                    _log.Debug("Checking if another instance of {0} is already running in directory {1}", attribute.InstanceKey, _workingDir);
                    instancePerDirectoryLock = new InstancePerDirectoryLock(attribute.InstanceKey ?? string.Empty);
                    var isFirstInstance = instancePerDirectoryLock.TryEnter(500);
                    if (!isFirstInstance)
                    {
                        _log.Info("Another instance of {0} is already running in directory {1}. Exiting.", attribute.InstanceKey, _workingDir);
                        return 1;
                    }
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

                var programType = attribute.EntryClass;
                _log.Info("Starting {0} with args: {1}", programType, string.Join(" ", _args));
                try
                {
                    _program = (IProgram) Activator.CreateInstance(programType);
                    var task = await _program.StartAsync(_args).ConfigureAwait(false);
                    _log.Info("Program {0} started", programType);
                    await task.ConfigureAwait(false);
                    _log.Info("Program {0} completed", programType);
                }
                catch (Exception ex)
                {
                    _log.Error(ex, "Unhandled exception in program {0}", programType);
                    return 1;
                }
            }
            catch (Exception ex)
            {
                _log.Error(ex, "Unhandled exception while starting program {0}", _path);
                return 1;
            }
            finally
            {                   
                if (instancePerDirectoryLock != null)
                {
                    _log.Debug("Releasing lock");
                    instancePerDirectoryLock.Dispose();
                }
                Directory.SetCurrentDirectory(curDir);
            }
            _log.Info("Program completed successfully: {0} {1}", _path, string.Join(" ", _args));
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
            _log.Info("Registering shutdown event: {0}", shutdownEventName);
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
