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
        private const string ServerName = "np-v1";
        private static readonly TimeSpan MaxServerInitializationTime = TimeSpan.FromSeconds(10);

        private readonly CancellationTokenSource _cancellation;
        private readonly ILogger _log;
        private readonly IServerStateReader _serverStateReader;

        public PipeTransmissionClient(string brokerWorkingDir, CancellationToken cancellationToken = default)
        {
            _cancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            _log = LogManager.GetLogger<PipeTransmissionClient>();
            _serverStateReader = new ServerStateReader(ServerName, brokerWorkingDir);
        }

        public async ValueTask<ITransmissionConnection> ConnectAsync()
        {
            var result = await TryConnectAsync().ConfigureAwait(false);
            if (!result.HasValue)
            {
                throw new OperationCanceledException();
            }
            return result.Value;
        }

        public void Dispose()
        {
            _cancellation.Cancel();
        }

        public ValueTask<Maybe<ITransmissionConnection>> TryConnectAsync()
        {
            return StreamTransmissionConnection.TryCreateAsync(UniqueId.Generate(), TryConnectStreamAsync);
        }

        private async ValueTask<Maybe<Stream>> TryConnectStreamAsync()
        {
            try
            {
                if (!await _serverStateReader.WaitInitializationAsync(MaxServerInitializationTime, _cancellation.Token)
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
                _log.Trace("Connecting to pipe {0}", pipeName);
                var pipeClientStream =
                    new NamedPipeClientStream(".", pipeName, PipeDirection.InOut, PipeOptions.Asynchronous);
                await ConnectAsync(pipeClientStream, _cancellation.Token).ConfigureAwait(false);
                _log.Trace("Connected to pipe {0}", pipeName);
                return pipeClientStream;
            }
            catch (OperationCanceledException) when (_cancellation.IsCancellationRequested)
            {
                return Maybe<Stream>.Nothing;
            }
        }

#if NET452
        private static async Task ConnectAsync(
            NamedPipeClientStream pipeClientStream,
            CancellationToken cancellationToken)
        {
            try
            {
                using (cancellationToken.Register(pipeClientStream.Dispose))
                {
                    var client = pipeClientStream;
                    await TaskRunner.RunInBackground(() => client.Connect(), cancellationToken).ConfigureAwait(false);
                }
            }
            catch
            {
                pipeClientStream.Dispose();
                cancellationToken.ThrowIfCancellationRequested();
                throw;
            }
        }
#else
        private static async Task ConnectAsync(
            NamedPipeClientStream pipeClientStream,
            CancellationToken cancellationToken)
        {
            try
            {
                await pipeClientStream.ConnectAsync(cancellationToken).ConfigureAwait(false);
            }
            catch
            {
                pipeClientStream.Dispose();
                throw;
            }
        }
#endif        
    }
}
