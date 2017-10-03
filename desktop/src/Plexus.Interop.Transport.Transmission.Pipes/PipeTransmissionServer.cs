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
﻿namespace Plexus.Interop.Transport.Transmission.Pipes
{
    using Plexus.Interop.Transport.Transmission.Streams;
    using System;
    using System.IO;
    using System.IO.Pipes;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class PipeTransmissionServer : StreamTransmissionConnectionFactoryBase, ITransmissionServer
    {
        private const string ServerName = "np-v1";

        private readonly ILogger _log;
        private readonly Promise _completion = new Promise();
        private readonly IServerStateWriter _settingsWriter;
        private readonly string _pipeName = "plexus-interop-broker-" + Guid.NewGuid();

        public PipeTransmissionServer(string brokerWorkingDir = null)
        {            
            _log = LogManager.GetLogger<PipeTransmissionServer>();
            brokerWorkingDir = brokerWorkingDir ?? Directory.GetCurrentDirectory();
            _settingsWriter = new ServerStateWriter(ServerName, brokerWorkingDir);
        }

        public Task Completion => _completion.Task;

        public Task StartAsync()
        {
            _log.Debug("Starting");
            _settingsWriter.Write("address", _pipeName);
            _settingsWriter.SignalInitialized();
            return TaskConstants.Completed;
        }

        public Task StopAsync()
        {
            _log.Debug("Stopping");

            // TODO: dispose all the active streams
            _completion.TryComplete();
            _settingsWriter.Dispose();
            return Completion.IgnoreExceptions();
        }

        public void Dispose()
        {
            _log.Trace("Disposing");
            StopAsync().GetResult();
        }

        protected override async ValueTask<Stream> ConnectAsync(CancellationToken cancellationToken)
        {            
            _log.Trace("Waiting for connection to pipe {0}", _pipeName);
            var pipeServerStream = new NamedPipeServerStream(
                _pipeName,
                PipeDirection.InOut,
                -1,
                PipeTransmissionMode.Byte,
                PipeOptions.Asynchronous);
            await WaitForConnectionAsync(pipeServerStream, cancellationToken).ConfigureAwait(false);
            _log.Trace("Received new connection to pipe {0}", _pipeName);

            // TODO: keep connected stream to dispose it on Stop
            return pipeServerStream;
        }

#if NET452
        private static async Task WaitForConnectionAsync(
            NamedPipeServerStream pipeServerStream,
            CancellationToken cancellationToken)
        {
            try
            {
                using (cancellationToken.Register(pipeServerStream.Dispose))
                {
                    await Task.Factory.FromAsync(pipeServerStream.BeginWaitForConnection, pipeServerStream.EndWaitForConnection, null);
                }
            }
            catch
            {
                pipeServerStream.Dispose();
                cancellationToken.ThrowIfCancellationRequested();
                throw;
            }
        }
#else
        private static async Task WaitForConnectionAsync(
            NamedPipeServerStream pipeServerStream,
            CancellationToken cancellationToken)
        {
            try
            {
                await pipeServerStream.WaitForConnectionAsync(cancellationToken).ConfigureAwait(false);
            }
            catch
            {
                pipeServerStream.Dispose();
                throw;
            }
        }
#endif
    }
}
