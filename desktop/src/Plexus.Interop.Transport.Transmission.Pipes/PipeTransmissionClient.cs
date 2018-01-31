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
    using Plexus.Interop.Transport.Transmission.Streams;
    using System;
    using System.IO;
    using System.IO.Pipes;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class PipeTransmissionClient : ITransmissionClient
    {
        private const int ConnectTimeoutMs = 10000;
        private const string ServerName = "np-v1";
        private static readonly TimeSpan MaxServerInitializationTime = TimeSpan.FromSeconds(10);

        private readonly ILogger _log;
        private readonly IServerStateReader _serverStateReader;

        public PipeTransmissionClient(string brokerWorkingDir)
        {
            _log = LogManager.GetLogger<PipeTransmissionClient>();
            _serverStateReader = new ServerStateReader(ServerName, brokerWorkingDir);
        }

        public async ValueTask<ITransmissionConnection> ConnectAsync(CancellationToken cancellationToken)
        {
            var connection = await StreamTransmissionConnection.CreateAsync(
                UniqueId.Generate(),
                () => ConnectStreamAsync(cancellationToken));
            _log.Trace("Created connection {0}", connection);
            return connection;
        }

        private async ValueTask<Stream> ConnectStreamAsync(CancellationToken cancellationToken)
        {
            if (!await _serverStateReader
                .WaitInitializationAsync(MaxServerInitializationTime, cancellationToken)
                .ConfigureAwait(false))
            {
                throw new TimeoutException(
                    $"Timeout ({MaxServerInitializationTime.TotalSeconds}sec) while waiting for server \"{ServerName}\" availability");
            }
            var pipeName = _serverStateReader.ReadSetting("address");
            if (string.IsNullOrEmpty(pipeName))
            {
                throw new InvalidOperationException("Cannot find pipe name to connect");
            }
            _log.Trace("Connecting to pipe");
            var pipeClientStream = new NamedPipeClientStream(".", pipeName, PipeDirection.InOut, PipeOptions.Asynchronous);
            try
            {
                await ConnectAsync(pipeClientStream, cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _log.Trace("Connection to pipe terminated: {0}", ex.FormatTypeAndMessage());
                pipeClientStream.Dispose();
                cancellationToken.ThrowIfCancellationRequested();
                throw;
            }
            _log.Trace("Connected to pipe");
            return pipeClientStream;
        }

#if NET452
        private static async Task ConnectAsync(
            NamedPipeClientStream pipeClientStream,
            CancellationToken cancellationToken)
        {
            await TaskRunner
                .RunInBackground(() => pipeClientStream.Connect(ConnectTimeoutMs), cancellationToken)
                .WithCancellation(cancellationToken, _ => pipeClientStream.Dispose())
                .ConfigureAwait(false);
            pipeClientStream.ReadMode = PipeTransmissionMode.Byte;
        }
#else
        private static async Task ConnectAsync(
            NamedPipeClientStream pipeClientStream,
            CancellationToken cancellationToken)
        {
            using (var combinedCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken))
            {
                combinedCancellation.CancelAfter(ConnectTimeoutMs);
                try
                {
                    await pipeClientStream
                        .ConnectAsync(cancellationToken)
                        .ConfigureAwait(false);
                }
                catch (OperationCanceledException) when (combinedCancellation.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
                {
                    throw new TimeoutException(
                        $"Timeout {ConnectTimeoutMs} ms occured while establishing named pipe connection");
                }
            }
        }
#endif
    }
}
