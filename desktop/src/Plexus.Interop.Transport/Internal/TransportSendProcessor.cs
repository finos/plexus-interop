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
 using Plexus.Interop.Transport.Transmission;
using System.Threading.Tasks;
using System;
using Plexus.Channels;
using Plexus.Interop.Protocol.Common;
using Plexus.Interop.Transport.Protocol;
using Plexus.Interop.Transport.Protocol.Serialization;

namespace Plexus.Interop.Transport.Internal
{
    internal sealed class TransportSendProcessor : ITransportSendProcessor
    {
        private readonly ILogger _log;
        private readonly ITransportHeaderFactory _transportHeaderFactory;
        private readonly IMessagingSendProcessor _sendProcessor;
        private readonly TransportConnectionStateValidator _stateValidator = new TransportConnectionStateValidator();

        public TransportSendProcessor(
            ITransmissionConnection connection,
            ITransportHeaderFactory transportHeaderFactory,
            ITransportProtocolSerializer serializer)
        {
            _sendProcessor = new MessagingSendProcessor(connection, serializer);
            _transportHeaderFactory = transportHeaderFactory;
            _log = LogManager.GetLogger<TransportSendProcessor>(_sendProcessor.Id.ToString());
            Out = new PropagatingChannel<ChannelMessage, TransportMessage>(
                3,
                _sendProcessor.Out,
                OpenConnectionAsync,
                SendAsync,
                CloseConnectionAsync,
                CloseConnectionAsync,
                Dispose);
            Out.Completion.LogCompletion(_log);
        }

        public UniqueId InstanceId => _sendProcessor.Id;

        public IWritableChannel<ChannelMessage> Out { get; }

        private async Task OpenConnectionAsync(IWriteOnlyChannel<TransportMessage> output)
        {
            var openHeader = _transportHeaderFactory.CreateConnectionOpenHeader(InstanceId);
            await SendAsync(new TransportMessage(openHeader), output).ConfigureAwait(false);
        }

        private async Task CloseConnectionAsync(IWriteOnlyChannel<TransportMessage> output)
        {
            var closeHeader = _transportHeaderFactory.CreateConnectionCloseHeader(CompletionHeader.Completed);
            await SendAsync(new TransportMessage(closeHeader), output).ConfigureAwait(false);
        }

        private async Task CloseConnectionAsync(Exception error, IWriteOnlyChannel<TransportMessage> output)
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
            await SendAsync(new TransportMessage(closeHeader), output).ConfigureAwait(false);
        }

        private static ErrorHeader GetErrorHeader(Exception error)
        {
            var message = error is RemoteErrorException remoteError ? remoteError.RemoteMessage : error.Message;
            return new ErrorHeader(message, error.FormatToString());
        }

        private Task SendAsync(ChannelMessage message, IWriteOnlyChannel<TransportMessage> output)
        {
            return SendAsync((TransportMessage)message, output);
        }

        private async Task SendAsync(TransportMessage message, IWriteOnlyChannel<TransportMessage> output)
        {
            try
            {
                _log.Trace("Sending {0}", message);
                await output.WriteAsync(message).ConfigureAwait(false);
            }
            catch
            {
                message.Dispose();
                throw;
            }
        }

        private void Dispose(ChannelMessage message)
        {
            _log.Trace("Disposing message {0}", message);
            message.Dispose();
        }
    }
}
