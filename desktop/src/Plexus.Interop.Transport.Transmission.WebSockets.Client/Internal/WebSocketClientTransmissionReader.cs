namespace Plexus.Interop.Transport.Transmission.WebSockets.Client.Internal
{
    using Plexus.Channels;
    using Plexus.Pools;
    using SuperSocket.ClientEngine;
    using System;
    using System.Threading;
    using System.Threading.Tasks;
    using WebSocket4Net;

    internal sealed class WebSocketClientTransmissionReader
    {
        private readonly ILogger _log;
        private readonly BufferedChannel<IPooledBuffer> _buffer = new BufferedChannel<IPooledBuffer>(3);
        private readonly CancellationToken _cancellationToken;
        private readonly WebSocket _webSocket;

        public WebSocketClientTransmissionReader(
            UniqueId id,
            WebSocket webSocket, 
            CancellationToken cancellationToken)
        {
            _log = LogManager.GetLogger<WebSocketClientTransmissionReader>(id.ToString());
            _cancellationToken = cancellationToken;
            _webSocket = webSocket;
            _webSocket.DataReceived += OnDataReceived;
            _webSocket.MessageReceived += OnMessageReceived;
            _webSocket.Closed += OnClosed;
            _webSocket.Error += OnError;

            Completion = TaskRunner.RunInBackground(ProcessAsync);            
        }

        public Task Completion { get; }

        public IReadOnlyChannel<IPooledBuffer> In => _buffer.In;

        private async Task ProcessAsync()
        {
            try
            {
                await _buffer.Out.Completion.ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminateWriting(ex);
                throw;
            }
            finally
            {
                _webSocket.DataReceived -= OnDataReceived;
                _webSocket.MessageReceived -= OnMessageReceived;
                _webSocket.Closed -= OnClosed;
                _webSocket.Error -= OnError;
            }
        }        

        private void OnError(object sender, ErrorEventArgs e)
        {
            _log.Trace("OnError: {0}", e.Exception.FormatToString());
            _buffer.Out.TryTerminateWriting(e.Exception);
        }

        private void OnClosed(object sender, EventArgs e)
        {
            _log.Trace("OnClosed");
            _buffer.Out.TryTerminateWriting();
        }

        private void OnMessageReceived(object sender, MessageReceivedEventArgs e)
        {
            if (string.Equals(e.Message, "<END>"))
            {
                _log.Trace("Received <END> message");
                _buffer.Out.TryCompleteWriting();
            }
            else
            {
                _log.Trace("OnMessageReceived: {0}", e.Message);
            }
        }

        private void OnDataReceived(object sender, DataReceivedEventArgs e)
        {
            _log.Trace("Received message of length={0}", e.Data.Length);
            var msg = PooledBuffer.Get(e.Data);
            try
            {
                _buffer.Out.WriteAsync(msg, _cancellationToken).GetResult();
            }
            catch (Exception ex)
            {                
                _log.Trace(ex, "Exception in OnDataReceived callback");
                msg.Dispose();
                _buffer.Out.TryTerminateWriting(ex);
            }
        }
    }
}
