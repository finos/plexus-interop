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
namespace Plexus.Interop.Transport.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol.Common;
    using Plexus.Interop.Transport.Protocol;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using System;
    using System.Threading.Tasks;

    internal sealed class TransportSendProcessor : ITransportSendProcessor
    {
        private readonly ILogger _log;
        private readonly ITransportHeaderFactory _transportHeaderFactory;
        private readonly IMessagingSendProcessor _sendProcessor;
        private readonly BufferedChannel<ChannelMessage> _buffer = new BufferedChannel<ChannelMessage>(3);

        public TransportSendProcessor(
            ITransmissionConnection connection,
            ITransportHeaderFactory transportHeaderFactory,
            ITransportProtocolSerializer serializer)
        {
            _sendProcessor = new MessagingSendProcessor(connection, serializer);
            _log = LogManager.GetLogger<TransportSendProcessor>(_sendProcessor.Id.ToString());
            _transportHeaderFactory = transportHeaderFactory;            
            _sendProcessor.Out.PropagateCompletionFrom(ProcessAsync());
            Completion = _sendProcessor.Completion.LogCompletion(_log);
        }

        public UniqueId InstanceId => _sendProcessor.Id;

        public ITerminatableWritableChannel<ChannelMessage> Out => _buffer.Out;

        public Task Completion { get; }

        private async Task ProcessAsync()
        {
            try
            {
                await OpenConnectionAsync().ConfigureAwait(false);
                await _buffer.In.ConsumeAsync(SendAsync).ConfigureAwait(false);
                await CloseConnectionAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                _buffer.In.DisposeBufferedItems();
                await CloseConnectionAsync(ex).ConfigureAwait(false);
            }
        }

        private async Task OpenConnectionAsync()
        {
            var openHeader = _transportHeaderFactory.CreateConnectionOpenHeader(InstanceId);
            await SendAsync(new TransportMessage(openHeader)).ConfigureAwait(false);
        }

        private async Task CloseConnectionAsync()
        {
            var closeHeader = _transportHeaderFactory.CreateConnectionCloseHeader(CompletionHeader.Completed);
            await SendAsync(new TransportMessage(closeHeader)).ConfigureAwait(false);
        }

        private async Task CloseConnectionAsync(Exception error)
        {
            ITransportConnectionCloseHeader closeHeader;
            if (error is OperationCanceledException)
            {
                closeHeader = _transportHeaderFactory.CreateConnectionCloseHeader(CompletionHeader.Canceled);
            }
            else
            {
                closeHeader = _transportHeaderFactory.CreateConnectionCloseHeader(CompletionHeader.Failed(GetErrorHeader(error)));
            }
            await SendAsync(new TransportMessage(closeHeader)).ConfigureAwait(false);
        }

        private static ErrorHeader GetErrorHeader(Exception error)
        {
            var message = error is RemoteErrorException remoteError ? remoteError.RemoteMessage : error.Message;
            return new ErrorHeader(message, error.FormatToString());
        }

        private Task SendAsync(ChannelMessage message)
        {
            return SendAsync((TransportMessage)message);
        }

        private async Task SendAsync(TransportMessage message)
        {
            try
            {
                _log.Trace("Sending {0}", message);
                await _sendProcessor.Out.WriteAsync(message).ConfigureAwait(false);
            }
            catch
            {
                message.Dispose();
                throw;
            }
        }
    }
}
