/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
    using System;
    using System.Threading.Tasks;

    internal sealed class TransportChannel : ITransportChannel
    {
        private readonly ILogger _log;
        private readonly TransportChannelSendProcessor _sendProcessor;
        private readonly IChannel<TransportMessageFrame> _receiveBuffer = new BufferedChannel<TransportMessageFrame>(3);
        private readonly TransportChannelHeaderHandler<Task, ChannelMessage> _incomingMessageHandler;        

        public TransportChannel(
            UniqueId connectionId,
            UniqueId channelId,
            IWritableChannel<ChannelMessage> output,
            IChannelHeaderFactory headerFactory)
        {
            ConnectionId = connectionId;
            Id = channelId;
            _log = LogManager.GetLogger<TransportChannel>($"{connectionId}.{channelId}");
            _incomingMessageHandler = new TransportChannelHeaderHandler<Task, ChannelMessage>(HandleIncomingAsync, HandleIncomingAsync, HandleIncomingAsync);
            _sendProcessor = new TransportChannelSendProcessor(connectionId, channelId, output, headerFactory);
            Completion = ProcessAsync().LogCompletion(_log);
        }

        public UniqueId Id { get; }

        public UniqueId ConnectionId { get; }

        public Task Completion { get; }

        internal Task Initialized => _sendProcessor.Initialized;

        internal bool TerminateReceiving(Exception error = null)
        {
            return _receiveBuffer.Out.TryTerminate(error);
        }

        public ITerminatableWritableChannel<TransportMessageFrame> Out => _sendProcessor.Out;

        public IReadableChannel<TransportMessageFrame> In => _receiveBuffer.In;

        public async Task HandleIncomingAsync(ChannelMessage message)
        {
            try
            {
                _log.Trace("Handling incoming message {0}", message);
                await message.Header.Handle(_incomingMessageHandler, message).ConfigureAwait(false);
            }
            catch (Exception ex)
            {                
                _log.Error(ex, "Exception while handling incoming message");
                _sendProcessor.Out.TryTerminate(ex);
                _receiveBuffer.Out.TryTerminate(ex);
            }
            finally
            {
                message.Header.Dispose();
            }
        }

        private Task ProcessAsync()
        {
            return Task.WhenAll(_sendProcessor.Completion, _receiveBuffer.In.Completion);
        }

        private async Task HandleIncomingAsync(ITransportFrameHeader header, ChannelMessage message)
        {
            try
            {
                await _receiveBuffer.Out.WriteAsync(new TransportMessageFrame(message.Payload.Value, header.HasMore)).ConfigureAwait(false);
            }
            catch
            {
                if (message.Payload.HasValue)
                {
                    message.Payload.Value.Dispose();
                }
                throw;
            }
        }

        private Task HandleIncomingAsync(ITransportChannelCloseHeader header, ChannelMessage message)
        {
            switch (header.Completion.Status)
            {
                case CompletionStatusHeader.Completed:
                    _receiveBuffer.Out.TryComplete();
                    break;
                case CompletionStatusHeader.Canceled:
                    _sendProcessor.Out.TryTerminate();
                    _receiveBuffer.Out.TryTerminate();
                    break;
                case CompletionStatusHeader.Failed:
                    var error = header.Completion.Error.Value;
                    _sendProcessor.Out.TryTerminate();
                    _receiveBuffer.Out.TryTerminate(new RemoteErrorException(error));
                    break;
                default:
                    throw new InvalidOperationException();
            }
            return TaskConstants.Completed;
        }

        private static Task HandleIncomingAsync(ITransportChannelOpenHeader header, ChannelMessage message)
        {
            return TaskConstants.Completed;
        }

        public override string ToString()
        {
            return $"{{{nameof(Id)}: {Id}, {nameof(ConnectionId)}: {ConnectionId}}}";
        }
    }
}
