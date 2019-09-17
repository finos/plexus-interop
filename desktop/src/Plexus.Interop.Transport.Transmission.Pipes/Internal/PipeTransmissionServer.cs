/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Transport.Transmission.Pipes.Internal
{
    using System;
    using System.IO;
    using System.IO.Pipes;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Channels;
    using Plexus.Interop.Transport.Transmission.Streams;
    using Plexus.Processes;

    internal sealed class PipeTransmissionServer : ProcessBase, ITransmissionServer
    {
        private const int AcceptedConnectionsBufferSize = 20;
        private const string ServerName = "np-v1";

        private readonly ILogger _log;
        private readonly IServerStateWriter _settingsWriter;
        private readonly string _pipeName = "plexus-interop-broker-" + Guid.NewGuid();
        private readonly BufferedChannel<ITransmissionConnection> _buffer 
            = new BufferedChannel<ITransmissionConnection>(AcceptedConnectionsBufferSize);

        public PipeTransmissionServer(string brokerWorkingDir)
        {
            _log = LogManager.GetLogger<PipeTransmissionServer>();
            _settingsWriter = new ServerStateWriter(ServerName, brokerWorkingDir);
            _buffer.Out.PropagateCompletionFrom(Completion);
        }

        public IReadableChannel<ITransmissionConnection> In => _buffer.In;

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
            using (_settingsWriter)
            {
                while (true)
                {
                    var connection = await StreamTransmissionConnection
                        .CreateAsync(UniqueId.Generate(), AcceptStreamAsync)
                        .ConfigureAwait(false);
                    try
                    {
                        await _buffer.Out
                            .WriteAsync(connection, CancellationToken)
                            .ConfigureAwait(false);
                    }
                    catch
                    {
                        await connection.DisconnectAsync().IgnoreExceptions().ConfigureAwait(false);
                        throw;
                    }
                }
            }
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
                await WaitForConnectionAsync(pipeServerStream, CancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _log.Trace("Waiting for new connection failed: {0}", ex.FormatTypeAndMessage());
                pipeServerStream.Dispose();
                throw;
            }
            _log.Trace("Received new connection");
            return pipeServerStream;
        }

#if NET45
        private static async Task WaitForConnectionAsync(
            NamedPipeServerStream pipeServerStream,
            CancellationToken cancellationToken)
        {
            try
            {
                await Task.Factory
                    .FromAsync(
                        pipeServerStream.BeginWaitForConnection,
                        pipeServerStream.EndWaitForConnection,
                        null)
                    .WithCancellation(cancellationToken);
            }
            catch
            {
                cancellationToken.ThrowIfCancellationRequested();
                throw;
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
