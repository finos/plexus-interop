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
    using Plexus.Interop.Transport.Transmission.Streams;

    internal sealed class PipeTransmissionClient : ITransmissionClient
    {        
        private const string ServerName = "np-v1";

        private static readonly TimeSpan ConnectTimeoutMs = TimeoutConstants.Timeout20Sec;
        private static readonly TimeSpan MaxServerInitializationTime = TimeoutConstants.Timeout1Min;
        private static readonly ILogger Log = LogManager.GetLogger<PipeTransmissionClient>();

        public async ValueTask<ITransmissionConnection> ConnectAsync(string brokerWorkingDir, CancellationToken cancellationToken)
        {
            var connection = await StreamTransmissionConnection.CreateAsync(
                UniqueId.Generate(),
                () => ConnectStreamAsync(brokerWorkingDir, cancellationToken));
            Log.Trace("Created connection {0}", connection);
            return connection;
        }

        private static async ValueTask<Stream> ConnectStreamAsync(string brokerWorkingDir, CancellationToken cancellationToken)
        {
            var pipeName = EnvironmentHelper.GetPipeAddress();
            if (string.IsNullOrEmpty(pipeName))
            {
                var serverStateReader = new ServerStateReader(ServerName, brokerWorkingDir);
                if (!await serverStateReader
                    .WaitInitializationAsync(MaxServerInitializationTime, cancellationToken)
                    .ConfigureAwait(false))
                {
                    throw new TimeoutException(
                        $"Timeout ({MaxServerInitializationTime.TotalSeconds}sec) while waiting for server \"{ServerName}\" availability");
                }

                pipeName = serverStateReader.ReadSetting("address");
            }

            if (string.IsNullOrEmpty(pipeName))
            {
                throw new InvalidOperationException("Cannot find pipe name to connect");
            }

            Log.Trace("Connecting to pipe");
            var pipeClientStream = new NamedPipeClientStream(".", pipeName, PipeDirection.InOut, PipeOptions.Asynchronous | PipeOptions.WriteThrough);
            try
            {
                await ConnectAsync(pipeClientStream, cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                Log.Trace("Connection to pipe terminated: {0}", ex.FormatTypeAndMessage());
                pipeClientStream.Dispose();
                cancellationToken.ThrowIfCancellationRequested();
                throw;
            }
            Log.Trace("Connected to pipe");
            return pipeClientStream;
        }

#if NET45
        private static async Task ConnectAsync(
            NamedPipeClientStream pipeClientStream,
            CancellationToken cancellationToken)
        {
            await TaskRunner
                .RunInBackground(() => pipeClientStream.Connect((int)ConnectTimeoutMs.TotalMilliseconds), cancellationToken)
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
