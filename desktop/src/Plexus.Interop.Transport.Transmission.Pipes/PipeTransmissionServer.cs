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
namespace Plexus.Interop.Transport.Transmission.Pipes
{
    using Plexus.Channels;
    using Plexus.Interop.Transport.Transmission.Streams;
    using Plexus.Processes;
    using System;
    using System.IO;
    using System.IO.Pipes;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class PipeTransmissionServer : ProcessBase, ITransmissionServer
    {
        private const string ServerName = "np-v1";

        private readonly ILogger _log;
        private readonly IServerStateWriter _settingsWriter;
        private readonly string _pipeName = "plexus-interop-broker-" + Guid.NewGuid();
        private readonly CancellationTokenSource _cancellation = new CancellationTokenSource();
        private readonly BufferedChannel<ITransmissionConnection> _buffer 
            = new BufferedChannel<ITransmissionConnection>(1);

        public PipeTransmissionServer(string brokerWorkingDir)
        {
            _log = LogManager.GetLogger<PipeTransmissionServer>();
            _settingsWriter = new ServerStateWriter(ServerName, brokerWorkingDir);
        }

        public IReadOnlyChannel<ITransmissionConnection> In => _buffer.In;

        public async Task StopAsync()
        {
            _log.Trace("Stopping");
            _cancellation.Cancel();
            Start();
            await Completion.IgnoreExceptions().ConfigureAwait(false);
            _log.Trace("Stopped");
        }

        protected override Task<Task> StartCoreAsync()
        {
            _log.Debug("Starting");
            _settingsWriter.Write("address", _pipeName);
            _settingsWriter.SignalInitialized();
            _log.Info("Pipe server started: {0}", _pipeName);
            return Task.FromResult(ProcessAsync());
        }
        
        private async Task ProcessAsync()
        {
            try
            {
                _cancellation.Token.ThrowIfCancellationRequested();
                while (true)
                {
                    var connection = await StreamTransmissionConnection
                        .CreateAsync(UniqueId.Generate(), AcceptStreamAsync)
                        .ConfigureAwait(false);
                    await _buffer.Out
                        .WriteAsync(connection, _cancellation.Token)
                        .ConfigureAwait(false);
                }
            }
            catch (OperationCanceledException) when (_cancellation.IsCancellationRequested)
            {
                _buffer.Out.TryCompleteWriting();
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminateWriting(ex);
                throw;
            }
            finally
            {
                _settingsWriter.Dispose();
            }
        }

        public void Dispose()
        {
            _log.Trace("Disposing");
            StopAsync().GetResult();
        }

        private async ValueTask<Stream> AcceptStreamAsync()
        {
            _log.Trace("Waiting for connection");
            var pipeServerStream = new NamedPipeServerStream(
                _pipeName,
                PipeDirection.InOut,
                -1,
                PipeTransmissionMode.Byte,
                PipeOptions.Asynchronous);
            try
            {
                await WaitForConnectionAsync(pipeServerStream, _cancellation.Token).ConfigureAwait(false);
            }
            catch
            {
                pipeServerStream.Dispose();
                throw;
            }
            _log.Trace("Received new connection");
            return pipeServerStream;
        }

#if NET452
        private static async Task WaitForConnectionAsync(NamedPipeServerStream pipeServerStream,
            CancellationToken cancellationToken)
        {
            using (cancellationToken.Register(pipeServerStream.Dispose))
            {
                await Task.Factory.FromAsync(
                    pipeServerStream.BeginWaitForConnection,
                    pipeServerStream.EndWaitForConnection, 
                    null);
            }
        }
#else
        private static async Task WaitForConnectionAsync(NamedPipeServerStream pipeServerStream, CancellationToken cancellationToken)
        {
            await pipeServerStream.WaitForConnectionAsync(cancellationToken).ConfigureAwait(false);
        }
#endif
    }
}
