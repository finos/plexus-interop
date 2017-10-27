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
﻿namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Transport;
    using Plexus.Processes;
    using System;
    using System.IO;
    using System.Threading.Tasks;

    internal sealed class InvocationReceiveProcessor<TResponse> : ProcessBase
    {
        private readonly ILogger _log;
        private readonly IReadOnlyChannel<TransportMessageFrame> _transport;
        private readonly InvocationMessageHandler<Nothing, Nothing> _incomingHandler;
        private readonly IProtocolImplementation _protocol;
        private readonly MemoryStream _curIncomingMessage = new MemoryStream();
        private readonly IMarshaller<TResponse> _marshaller;
        private readonly BufferedChannel<TResponse> _buffer = new BufferedChannel<TResponse>(1);
        private readonly InvocationState _invocationState;
        private readonly IWriteOnlyChannel<IInvocationMessage> _sender;

        private IncomingStreamState _incomingStreamState;

        public InvocationReceiveProcessor(
            UniqueId id,
            IReadOnlyChannel<TransportMessageFrame> transport, 
            IProtocolImplementation protocol, 
            IMarshaller<TResponse> marshaller, 
            IWriteOnlyChannel<IInvocationMessage> sender, 
            InvocationState invocationState)
        {
            _log = LogManager.GetLogger<InvocationReceiveProcessor<TResponse>>(id.ToString());
            _transport = transport;
            _protocol = protocol;
            _marshaller = marshaller;
            _sender = sender;
            _invocationState = invocationState;
            _incomingHandler = new InvocationMessageHandler<Nothing, Nothing>(
                HandleIncomingMessageHeader,
                HandleIncomingConfirmation,
                HandleIncomingCompletion);
            _buffer.Out.PropagateCompletionFrom(Completion);
        }

        protected override ILogger Log => _log;

        public IReadOnlyChannel<TResponse> ResponseStream => _buffer.In;

        public Task ResponseCompletion => _buffer.Out.Completion;

        protected override Task<Task> StartCoreAsync()
        {
            return Task.FromResult(ProcessAsync());
        }

        private async Task ProcessAsync()
        {
            await _transport.ConsumeAsync(HandleIncomingFrameAsync, CancellationToken).ConfigureAwait(false);
        }

        private async Task HandleIncomingFrameAsync(TransportMessageFrame frame)
        {
            _log.Trace("Handling incoming frame {0}. Current state: {1}.", frame, _incomingStreamState);
            switch (_incomingStreamState)
            {
                case IncomingStreamState.Open:
                case IncomingStreamState.Completed:
                    HandleIncomingHeader(frame);
                    break;
                case IncomingStreamState.ReceivingMessage:
                    await HandleIncomingMessageFrameAsync(frame).ConfigureAwait(false);
                    break;
                default:
                    throw new InvalidOperationException($"Unexpected state {_incomingStreamState}");
            }
            _log.Trace("Handled incoming frame {0}. Current state: {1}.", frame, _incomingStreamState);
        }

        private void HandleIncomingHeader(TransportMessageFrame frame)
        {
            using (var header = _protocol.Serializer.DeserializeInvocationMessage(frame.Payload))
            {
                _log.Trace("Handling incoming header: {0}. Current state: {1}.", header, _incomingStreamState);
                header.Handle(_incomingHandler);
            }
        }

        private async Task HandleIncomingMessageFrameAsync(TransportMessageFrame frame)
        {
            _log.Trace("Consuming message frame: {0}", frame);
            _curIncomingMessage.Write(frame.Payload.Array, frame.Payload.Offset, frame.Payload.Count);
            if (!frame.HasMore)
            {
                _curIncomingMessage.Position = 0;
                var msg = _marshaller.Decode(_curIncomingMessage);                
                await _buffer.Out.WriteAsync(msg, CancellationToken).ConfigureAwait(false);
                _log.Debug("Received message of type {0} with length {1}", msg.GetType().Name, _curIncomingMessage.Length);
                _curIncomingMessage.Position = 0;
                _curIncomingMessage.SetLength(0);
                _incomingStreamState = IncomingStreamState.Open;
                var header = _protocol.MessageFactory.CreateInvocationMessageReceived();
                await _sender.WriteOrDisposeAsync(header, CancellationToken).ConfigureAwait(false);
            }
        }

        private Nothing HandleIncomingCompletion(IInvocationSendCompleted completion, Nothing _)
        {
            switch (_incomingStreamState)
            {
                case IncomingStreamState.Open:
                    _log.Debug("Incoming message stream completed");
                    _incomingStreamState = IncomingStreamState.Completed;
                    _buffer.Out.TryCompleteWriting();
                    break;
                case IncomingStreamState.ReceivingMessage:
                case IncomingStreamState.Completed:
                    throw new InvalidOperationException($"Received unexpected message when in state {_incomingStreamState}: {completion}");
            }
            return Nothing.Instance;
        }

        private Nothing HandleIncomingConfirmation(IInvocationMessageReceived confirmation, Nothing _)
        {
            switch (_incomingStreamState)
            {
                case IncomingStreamState.Open:
                case IncomingStreamState.Completed:
                    _invocationState.OnConfirmationReceived();
                    break;
                case IncomingStreamState.ReceivingMessage:                
                    throw new InvalidOperationException(
                        $"Received unexpected message when in state {_incomingStreamState}: {confirmation}");
            }
            return Nothing.Instance;
        }

        private Nothing HandleIncomingMessageHeader(IInvocationMessageHeader header, Nothing _)
        {
            switch (_incomingStreamState)
            {
                case IncomingStreamState.Open:
                    _incomingStreamState = IncomingStreamState.ReceivingMessage;
                    break;
                case IncomingStreamState.ReceivingMessage:
                case IncomingStreamState.Completed:
                    throw new InvalidOperationException($"Received unexpected message when in state {_incomingStreamState}: {header}");
            }
            return Nothing.Instance;
        }
    }
}
