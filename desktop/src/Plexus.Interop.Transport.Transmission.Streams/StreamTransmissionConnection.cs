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
namespace Plexus.Interop.Transport.Transmission.Streams
{
    using Plexus.Channels;
    using Plexus.Pools;
    using System;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class StreamTransmissionConnection : ITransmissionConnection
    {
        private const int EndMessage = 65535;
        private readonly ILogger _log;
        private readonly byte[] _readLengthBuffer = new byte[2];
        private readonly byte[] _writeLengthBuffer = new byte[2];
        private int _disposed;
        private readonly Stream _stream;
        private readonly CancellationToken _cancellationToken;
        private readonly ProducingChannel<IPooledBuffer> _receiver;
        private long _receiveCount;
        private long _sendCount;

        private StreamTransmissionConnection(UniqueId id, Stream stream, CancellationToken cancellationToken)
        {
            Id = id;
            _log = LogManager.GetLogger<StreamTransmissionConnection>(id.ToString());
            _stream = stream;
            _cancellationToken = cancellationToken;
            Out = new ConsumingChannel<IPooledBuffer>(3, SendAsync, CompleteSendingAsync, DisposeRejected);
            _receiver = new ProducingChannel<IPooledBuffer>(3, ReceiveLoopAsync);
            In = _receiver;
            Completion = TaskRunner.RunInBackground(ProcessAsync).LogCompletion(_log);
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public IWritableChannel<IPooledBuffer> Out { get; }

        public IReadOnlyChannel<IPooledBuffer> In { get; }

        public void Dispose()
        {
            if (Interlocked.Exchange(ref _disposed, 1) == 0)
            {
                _log.Trace("Disposing stream");
                _stream.Dispose();
            }
        }

        public static async ValueTask<Maybe<ITransmissionConnection>> TryCreateAsync(
            UniqueId id, 
            Func<ValueTask<Maybe<Stream>>> streamFactory,
            CancellationToken cancellationToken)
        {
            var result = await streamFactory().ConfigureAwait(false);
            return result.HasValue 
                ? new StreamTransmissionConnection(id, result.Value, cancellationToken) 
                : Maybe<ITransmissionConnection>.Nothing;
        }

        public static async ValueTask<ITransmissionConnection> CreateAsync(
            UniqueId id, 
            Func<ValueTask<Stream>> streamFactory,
            CancellationToken cancellationToken)
        {
            var result = await streamFactory().ConfigureAwait(false);
            return new StreamTransmissionConnection(id, result, cancellationToken);
        }

        private async Task ProcessAsync()
        {
            try
            {
                await Task.WhenAll(In.Completion, Out.Completion).ConfigureAwait(false);
            }
            finally
            {
                Dispose();
            }
        }

        private async Task ReceiveLoopAsync(IWriteOnlyChannel<IPooledBuffer> received, CancellationToken cancellationToken)
        {
            var cancellation = CancellationTokenSource.CreateLinkedTokenSource(_cancellationToken, cancellationToken);
            try
            {
                while (true)
                {
                    _log.Trace("Awaiting next message {0}", _receiveCount);
                    var length = await ReadLengthAsync(cancellation.Token).ConfigureAwait(false);
                    if (length == EndMessage)
                    {
                        _log.Trace("Completing receiving datagrams because <END> message received");
                        break;
                    }
                    _log.Trace("Reading message {0} of length {1}", _receiveCount, length);
                    var datagram = await PooledBuffer
                        .Get(_stream, length, cancellation.Token)
                        .ConfigureAwait(false);
                    try
                    {
                        await received.WriteAsync(datagram, cancellation.Token).ConfigureAwait(false);
                    }
                    catch
                    {
                        datagram.Dispose();
                        throw;
                    }                    
                    _log.Trace("Received message {0} of length {1}", _receiveCount, length);
                    _receiveCount++;
                }
            }
            catch
            {
                Out.TryTerminate();
                throw;
            }
            finally
            {
                cancellation.Dispose();
            }
        }

        private void DisposeRejected(IPooledBuffer msg)
        {
            msg.Dispose();
        }

        private async Task SendAsync(IPooledBuffer datagram)
        {
            try
            {
                var length = datagram.Count;
                _log.Trace("Sending message {0} of length: {1}", _sendCount, length);
                await WriteLengthAsync(datagram.Count).ConfigureAwait(false);
                await _stream.WriteAsync(datagram.Array, datagram.Offset, length, _cancellationToken).ConfigureAwait(false);
                await _stream.FlushAsync(_cancellationToken).ConfigureAwait(false);
                _log.Trace("Sent message {0} of length {1}", _sendCount, length);
                _sendCount++;
            }
            catch
            {
                _receiver.TryTerminate();
                throw;
            }
            finally
            {
                datagram.Dispose();
            }
        }

        private async Task CompleteSendingAsync()
        {
            try
            {
                _log.Trace("Sending <END> message to complete sending");
                await WriteLengthAsync(EndMessage).ConfigureAwait(false);
                await _stream.FlushAsync(_cancellationToken).ConfigureAwait(false);

            }
            catch
            {
                _receiver.TryTerminate();
                throw;
            }
        }

        private async Task WriteLengthAsync(int length)
        {
            _writeLengthBuffer[0] = (byte)(length >> 8);
            _writeLengthBuffer[1] = (byte)length;
            await _stream.WriteAsync(_writeLengthBuffer, 0, 2, _cancellationToken).ConfigureAwait(false);
        }

        private async Task<int> ReadLengthAsync(CancellationToken cancellationToken)
        {
            var length = await _stream.ReadAsync(_readLengthBuffer, 0, 2, cancellationToken).ConfigureAwait(false);
            if (length != 2)
            {
                throw new InvalidOperationException("Stream completed unexpectedly");
            }
            return (_readLengthBuffer[0] << 8) | _readLengthBuffer[1];
        }
    }
}
