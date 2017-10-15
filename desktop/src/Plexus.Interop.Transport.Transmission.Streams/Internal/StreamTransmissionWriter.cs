namespace Plexus.Interop.Transport.Transmission.Streams.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using System;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class StreamTransmissionWriter
    {
        private const int EndMessage = 65535;

        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly byte[] _lengthBuffer = new byte[2];
        private readonly Stream _stream;
        private readonly CancellationToken _cancellationToken;
        private readonly ILogger _log;
        private long _count;

        public StreamTransmissionWriter(
            UniqueId id, 
            Stream stream, 
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<StreamTransmissionWriter>(id.ToString());
            _stream = stream;
            _cancellationToken = cancellationToken;
            Completion = TaskRunner.RunInBackground(ProcessAsync).LogCompletion(_log);
        }

        public Task Completion { get; }

        public IWritableChannel<IPooledBuffer> Out => _buffer.Out;

        private async Task ProcessAsync()
        {
            try
            {
                await _buffer.In.ConsumeAsync(SendAsync, _cancellationToken, CompleteSendingAsync).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminateWriting(ex);
                _buffer.In.DisposeBufferedItems();
                throw;
            }
        }

        private async Task SendAsync(IPooledBuffer datagram)
        {
            using (datagram)
            {
                var length = datagram.Count;
                _log.Trace("Sending message {0} of length: {1}", _count, length);
                await WriteLengthAsync(length).ConfigureAwait(false);
                await _stream.WriteAsync(datagram.Array, datagram.Offset, length, _cancellationToken)
                    .ConfigureAwait(false);
                await _stream.FlushAsync(_cancellationToken).ConfigureAwait(false);
                _log.Trace("Sent message {0} of length {1}", _count, length);
                _count++;
            }
        }

        private async Task CompleteSendingAsync()
        {
                _log.Trace("Sending <END> message to complete sending");
                await WriteLengthAsync(EndMessage).ConfigureAwait(false);
                await _stream.FlushAsync(_cancellationToken).ConfigureAwait(false);
        }

        private async Task WriteLengthAsync(int length)
        {
            _lengthBuffer[0] = (byte)(length >> 8);
            _lengthBuffer[1] = (byte)length;
            await _stream.WriteAsync(_lengthBuffer, 0, 2, _cancellationToken).ConfigureAwait(false);
        }
    }
}
