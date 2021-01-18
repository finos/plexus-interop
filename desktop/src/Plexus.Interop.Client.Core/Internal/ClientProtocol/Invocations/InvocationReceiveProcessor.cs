/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Internal.ClientProtocol.Invocations
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
        private readonly IReadableChannel<TransportMessageFrame> _transport;
        private readonly InvocationMessageHandler<Nothing, Nothing> _incomingHandler;
        private readonly IProtocolImplementation _protocol;
        private readonly MemoryStream _curIncomingMessage = new MemoryStream();
        private readonly IMarshaller<TResponse> _marshaller;
        private readonly BufferedChannel<TResponse> _responses = new BufferedChannel<TResponse>(1);
        private readonly BufferedChannel<TResponse> _buffer = new BufferedChannel<TResponse>(5);
        private readonly InvocationState _invocationState;
        private readonly IWritableChannel<IInvocationMessage> _sender;

        private IncomingStreamState _incomingStreamState;

        public InvocationReceiveProcessor(
            UniqueId id,
            IReadableChannel<TransportMessageFrame> transport, 
            IProtocolImplementation protocol, 
            IMarshaller<TResponse> marshaller, 
            IWritableChannel<IInvocationMessage> sender, 
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
        }

        protected override ILogger Log => _log;

        public IReadableChannel<TResponse> ResponseStream => _responses.In;

        public Task ResponseCompletion => _responses.Out.Completion;

        protected override Task<Task> StartCoreAsync()
        {
            return Task.FromResult(ProcessAsync());
        }        

        private async Task ProcessAsync()
        {
            _responses.Out.PropagateCompletionFrom(_buffer.ConsumeAsync(HandleResponseMessageAsync, CancellationToken));
            await Task.WhenAll(
                    ProcessMessagesAsync(),
                    ResponseCompletion)
                .ConfigureAwait(false);
        }

        private async Task HandleResponseMessageAsync(TResponse msg)
        {
            var header = _protocol.MessageFactory.CreateInvocationMessageReceived();
            if (!_sender.TryWrite(header))
            {
                await _sender.WriteOrDisposeAsync(header, CancellationToken).ConfigureAwait(false);
            }
            Log.Debug("Sent confirmation about received response of type {0}", msg.GetType().Name);
            if (!_responses.TryWrite(msg))
            {
                await _responses.WriteAsync(msg, CancellationToken).ConfigureAwait(false);
            }
            Log.Debug("Consumed response of type {0}", msg.GetType().Name);
        }

        private async Task ProcessMessagesAsync()
        {
            try
            {
                await _transport.ConsumeAsync(HandleIncomingFrameAsync, CancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                _buffer.In.ConsumeBufferedItems(_ => { });
                throw;
            }
            finally
            {
                await _buffer.In.Completion.ConfigureAwait(false);
            }
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
            if (frame.HasMore)
            {
                _log.Trace("Consumed message frame {0}", frame);
            }
            else
            {
                _curIncomingMessage.Position = 0;
                var msg = _marshaller.Decode(_curIncomingMessage);
                _log.Debug("Received message of type {0} with length {1}", msg.GetType().Name, _curIncomingMessage.Length);
                await _buffer.Out.WriteAsync(msg, CancellationToken).ConfigureAwait(false);
                _log.Debug("Received message added to response buffer: type {0} with length {1}", msg.GetType().Name, _curIncomingMessage.Length);
                _curIncomingMessage.Position = 0;
                _curIncomingMessage.SetLength(0);
                _incomingStreamState = IncomingStreamState.Open;
            }
        }

        private Nothing HandleIncomingCompletion(IInvocationSendCompleted completion, Nothing _)
        {
            switch (_incomingStreamState)
            {
                case IncomingStreamState.Open:
                    _log.Debug("Incoming message stream completed");
                    _incomingStreamState = IncomingStreamState.Completed;
                    _buffer.Out.TryComplete();
                    break;
                default:
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
                    Log.Trace("Confirmation received: {0}", _invocationState);
                    break;
                default:
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
                default:
                    throw new InvalidOperationException($"Received unexpected message when in state {_incomingStreamState}: {header}");
            }
            return Nothing.Instance;
        }
    }
}
