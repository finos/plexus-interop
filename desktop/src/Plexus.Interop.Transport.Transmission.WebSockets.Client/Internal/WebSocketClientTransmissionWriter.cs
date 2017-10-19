namespace Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using Plexus.Processes;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using WebSocket4Net;

    internal sealed class WebSocketClientTransmissionWriter : ProcessBase
    {
        private readonly ILogger _log;
        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly CancellationToken _cancellationToken;
        private readonly WebSocket _webSocket;

        public WebSocketClientTransmissionWriter(
            UniqueId id,
            WebSocket webSocket,
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<WebSocketClientTransmissionReader>(id.ToString());
            _cancellationToken = cancellationToken;
            _webSocket = webSocket;
        }

        public IWritableChannel<IPooledBuffer> Out => _buffer.Out;

        protected override Task<Task> StartCoreAsync()
        {
            return Task.FromResult(ProcessAsync());
        }        

        private async Task ProcessAsync()
        {
            try
            {
                await _buffer.In.ConsumeAsync((Action<IPooledBuffer>) Send, _cancellationToken).ConfigureAwait(false);
                _log.Trace("Sending <END> message");
                _webSocket.Send("<END>");
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminateWriting(ex);
                _buffer.In.DisposeBufferedItems();
                throw;
            }
        }

        private void Send(IPooledBuffer msg)
        {
            using (msg)
            {
                _log.Trace("Sending message of length {0}", msg.Count);
                _webSocket.Send(msg.Array, msg.Offset, msg.Count);
            }
        }
    }
}
