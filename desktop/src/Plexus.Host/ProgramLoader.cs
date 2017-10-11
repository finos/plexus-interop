namespace Plexus.Host
{
    using Plexus.Channels;
    using Plexus.Logging.NLog;
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.IO.Pipes;
    using System.Linq;
    using System.Reflection;
    using System.Security.Cryptography;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using System.Xml.Serialization;

    internal sealed class ProgramLoader : IDisposable
    {
        private static readonly TimeSpan ShutdownTimeout = TimeSpan.FromSeconds(5);
        private static readonly XmlSerializer XmlSerializer = new XmlSerializer(typeof(string[]));
        private static readonly HashAlgorithm Hasher = MD5.Create();

        private readonly byte[] _readBuffer = new byte[64 * 1024];
        private readonly IChannel<string[]> _incomingRequestBuffer = new BufferedChannel<string[]>(3);
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
            var cancellation = new CancellationTokenSource();
            InstancePerDirectoryLock instancePerDirectoryLock = null;
            var curDir = Directory.GetCurrentDirectory();
            Directory.SetCurrentDirectory(_workingDir);
            var listenRequestsTask = TaskConstants.Completed;
            var handleRequestsTask = TaskConstants.Completed;
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
                    _log.Debug("Checking if another instance is running");
                    var pipe = attribute.InstanceKey + "-" +
                               BitConverter.ToString(Hasher.ComputeHash(Encoding.UTF8.GetBytes(_workingDir)));
                    instancePerDirectoryLock = new InstancePerDirectoryLock(attribute.InstanceKey ?? string.Empty);
                    var isFirstInstance = instancePerDirectoryLock.TryEnter(500);
                    if (isFirstInstance)
                    {
                        listenRequestsTask = ListenOtherInstanceRequestsAsync(pipe, cancellation.Token);
                    }
                    else
                    {
                        _log.Info("Another instance of {0} is already running in directory {1}. Connecting to the running instance...", attribute.InstanceKey, _workingDir);
                        using (var namedPipeClient =
                            new NamedPipeClientStream(".", pipe, PipeDirection.InOut, PipeOptions.Asynchronous))
                        {
                            await namedPipeClient.ConnectAsync(3000, cancellation.Token).ConfigureAwait(false);
                            string serializeArgs;
                            using (var writer = new StringWriter(new StringBuilder()))
                            {
                                XmlSerializer.Serialize(writer, _args);
                                serializeArgs = writer.ToString();
                            }
                            var bytes = Encoding.UTF8.GetBytes(serializeArgs);
                            await namedPipeClient.WriteAsync(bytes, 0, bytes.Length, cancellation.Token).ConfigureAwait(false);
                            await namedPipeClient.FlushAsync(cancellation.Token).ConfigureAwait(false);
                            namedPipeClient.Close();
                            _log.Info("Forwared args to the already running instance: {0}", string.Join(", ", _args));
                        }
                        return 0;
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
                    if (attribute.InstanceAwareness != InstanceAwareness.MultiInstance)
                    {
                        handleRequestsTask = HandleOtherInstanceRequestsAsync(_program, cancellation.Token);
                    }
                    await task.ConfigureAwait(false);
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
                cancellation.Cancel();
                await Task.WhenAll(listenRequestsTask, handleRequestsTask).IgnoreExceptions().ConfigureAwait(false);
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

        private async Task HandleOtherInstanceRequestsAsync(IProgram program, CancellationToken cancellationToken)
        {
            while (await _incomingRequestBuffer.In.WaitForNextSafeAsync().ConfigureAwait(false))
            {
                while (_incomingRequestBuffer.In.TryReadSafe(out var args))
                {
                    try
                    {
                        if (!cancellationToken.IsCancellationRequested)
                        {
                            await program.HandleOtherInstanceRequestAsync(args).ConfigureAwait(false);
                        }
                    }
                    catch (Exception ex)
                    {
                        _log.Error(ex, "Exception while handling other instance request");
                    }
                }
            }
        }

        private async Task ListenOtherInstanceRequestsAsync(string pipe, CancellationToken cancellationToken)
        {
            try
            {
                while (true)
                {
                    using (var pipeServer =
                        new NamedPipeServerStream(
                            pipe, 
                            PipeDirection.InOut, 
                            -1, 
                            PipeTransmissionMode.Byte,
                            PipeOptions.Asynchronous))
                    {
                        await pipeServer
                            .WaitForConnectionAsync(cancellationToken)
                            .ConfigureAwait(false);
                        if (!pipeServer.IsConnected)
                        {
                            return;
                        }
                        var count = await pipeServer
                            .ReadAsync(_readBuffer, 0, _readBuffer.Length, cancellationToken)
                            .ConfigureAwait(false);
                        pipeServer.Close();
                        try
                        {
                            var xml = Encoding.UTF8.GetString(_readBuffer, 0, count);
                            var args = (string[]) XmlSerializer.Deserialize(new StringReader(xml));
                            _log.Debug("Received new incoming request: {0}", string.Join(" ", args));
                            await _incomingRequestBuffer.Out
                                .WriteAsync(args)
                                .ConfigureAwait(false);
                        }
                        catch (Exception ex)
                        {
                            _log.Error(ex, "Unhandled exception while parsing received request");
                        }
                    }
                }
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
            }
            finally
            {
                _incomingRequestBuffer.Out.TryComplete();
            }
            _log.Info("Completed listening for incoming requests");
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
