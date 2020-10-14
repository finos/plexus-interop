/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
 namespace Plexus.Interop.Transport.Transmission.Streams.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using System;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class StreamTransmissionReader
    {
        private const int EndMessage = 65535;

        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly byte[] _lengthBuffer = new byte[2];
        private readonly Stream _stream;
        private readonly CancellationToken _cancellationToken;
        private readonly ILogger _log;
        private long _count;

        public StreamTransmissionReader(
            UniqueId id, 
            Stream stream, 
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<StreamTransmissionReader>(id.ToString());
            _stream = stream;
            _cancellationToken = cancellationToken;
            _buffer.Out.PropagateCompletionFrom(ProcessAsync());
            _buffer.Out.Completion.LogCompletion(_log);
        }

        public IReadableChannel<IPooledBuffer> In => _buffer.In;

        private async Task ProcessAsync()
        {
            try
            {
                while (true)
                {
                    _log.Trace("Awaiting next message {0}", _count);
                    var length = await ReadLengthAsync().ConfigureAwait(false);
                    if (length == EndMessage)
                    {
                        _log.Trace("Completing receiving datagrams because <END> message received");
                        break;
                    }
                    _log.Trace("Reading message {0} of length {1}", _count, length);
                    var datagram = await ReadDatagram(length);
                    await WriteDatagram(datagram);
                    _log.Trace("Received message {0} of length {1}", _count, length);
                    _count++;
                }
                _buffer.Out.TryComplete();
            }
            catch (Exception ex)
            {
                _log.Warn(ex, "Process failed");
                _buffer.Out.TryTerminate(ex);
                _buffer.In.DisposeBufferedItems();
                throw;
            }
        }

        private async Task<int> ReadLengthAsync()
        {
            try
            {
                var readBytes = await ReadAsync(_lengthBuffer, 0, 2);
                while (readBytes < 2)
                {
                    _log.Info($"Read {readBytes} while reading length. Will try to read next byte");
                    readBytes += await ReadAsync(_lengthBuffer, readBytes, 2 - readBytes);
                }
                return (_lengthBuffer[0] << 8) | _lengthBuffer[1];
            }
            catch (Exception ex)
            {
                _log.Warn(ex, "Caught exception during attempt to read length");
                throw;
            }
        }

        private async Task<int> ReadAsync(byte[] buffer, int offset, int count)
        {
            int readBytes;
#if NETSTANDARD2_0
            readBytes = await _stream.ReadAsync(buffer, offset, count, _cancellationToken).ConfigureAwait(false);
#else
            readBytes = await _stream.ReadAsync(buffer, offset, count, _cancellationToken).WithCancellation(_cancellationToken).ConfigureAwait(false);
#endif
            if (readBytes == 0)
            {
                throw new InvalidOperationException("Stream completed unexpectedly");
            }
            return readBytes;
        }

        private async Task<IPooledBuffer> ReadDatagram(int length)
        {
            try
            {
                var datagram = await PooledBuffer
                    .Get(_stream, length, _cancellationToken)
                    .ConfigureAwait(false);
                return datagram;
            }
            catch (Exception ex)
            {
                _log.Warn(ex, $"Caught exception during attempt to read datagram of length {length}");
                throw;
            }
        }

        private async Task WriteDatagram(IPooledBuffer datagram)
        {
            try
            {
                await _buffer.Out.WriteAsync(datagram, _cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _log.Warn(ex, $"Caught exception during attempt to write datagram of length {datagram.Count}");
                datagram.Dispose();
                throw;
            }
        }
    }
}
