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
namespace Plexus.Interop.Transport.Transmission.Pipes.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Transport.Transmission.Streams;
    using Plexus.Processes;
    using System;
    using System.IO;
    using System.IO.Pipes;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class PipeTransmissionServer : ProcessBase, ITransmissionServer
    {
        private const string ServerName = "np-v1";

        private readonly ILogger _log;
        private readonly IServerStateWriter _settingsWriter;
        private readonly string _pipeName = "plexus-interop-broker-" + Guid.NewGuid();
        private readonly CancellationTokenSource _cancellation;
        private readonly BufferedChannel<ITransmissionConnection> _incomingConnections 
            = new BufferedChannel<ITransmissionConnection>(1);

        public PipeTransmissionServer(TransmissionServerOptions options)
        {
            _cancellation = CancellationTokenSource.CreateLinkedTokenSource(options.CancellationToken);
            _log = LogManager.GetLogger<PipeTransmissionServer>();
            _settingsWriter = new ServerStateWriter(ServerName, options.BrokerWorkingDir);
        }

        public ValueTask<Maybe<ITransmissionConnection>> TryAcceptAsync()
        {
            return _incomingConnections.TryReadAsync();
        }

        public ValueTask<ITransmissionConnection> AcceptAsync()
        {
            return _incomingConnections.ReadAsync();
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
                while (true)
                {
                    var result = await StreamTransmissionConnection
                        .TryCreateAsync(UniqueId.Generate(), TryAcceptStreamAsync, _cancellation.Token)
                        .ConfigureAwait(false);
                    if (!result.HasValue)
                    {
                        break;
                    }
                    await _incomingConnections.Out.WriteAsync(result.Value).ConfigureAwait(false);
                }
                _incomingConnections.Out.TryCompleteWriting();
            }
            catch (OperationCanceledException) when (_cancellation.IsCancellationRequested)
            {
                _incomingConnections.Out.TryCompleteWriting();
            }
            catch (Exception ex)
            {
                _incomingConnections.Out.TryTerminateWriting(ex);
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
            _cancellation.Cancel();
            Completion.IgnoreExceptions().GetResult();
        }

        private async ValueTask<Maybe<Stream>> TryAcceptStreamAsync()
        {
            _log.Trace("Waiting for connection");
            var pipeServerStream = new NamedPipeServerStream(
                _pipeName,
                PipeDirection.InOut,
                -1,
                PipeTransmissionMode.Byte,
                PipeOptions.Asynchronous);
            if (!await WaitForConnectionAsync(pipeServerStream).ConfigureAwait(false))
            {
                return Maybe<Stream>.Nothing;
            }
            _log.Trace("Received new connection");
            // TODO: keep connected stream to dispose it on Stop?
            return pipeServerStream;
        }

#if NET452
        private async Task<bool> WaitForConnectionAsync(NamedPipeServerStream pipeServerStream)
        {
            try
            {
                using (_cancellation.Token.Register(pipeServerStream.Dispose))
                {
                    await Task.Factory.FromAsync(pipeServerStream.BeginWaitForConnection, pipeServerStream.EndWaitForConnection, null);
                }                
            }
            catch when (_cancellation.IsCancellationRequested)
            {
                pipeServerStream.Dispose();
                return false;
            }
            catch
            {
                pipeServerStream.Dispose();
                throw;
            }
            return true;
        }
#else
        private async Task<bool> WaitForConnectionAsync(NamedPipeServerStream pipeServerStream)
        {
            try
            {
                await pipeServerStream.WaitForConnectionAsync(_cancellation.Token).ConfigureAwait(false);
            }
            catch when (_cancellation.IsCancellationRequested)
            {
                pipeServerStream.Dispose();
                return false;
            }
            catch
            {
                pipeServerStream.Dispose();
                throw;
            }
            return true;
        }
#endif
    }
}
