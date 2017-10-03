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
namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Transport;
    using Plexus.Pools;
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Plexus.Processes;

    internal abstract class Invocation<TRequest, TResponse> : ProcessBase, IInvocation<TRequest, TResponse>
    {
        private readonly ILogger _log;
        private readonly ITransportChannel _channel;
        private readonly IProtocolImplementation _protocol;
        private readonly IMarshaller<TRequest> _requestMarshaller;
        private readonly IMarshaller<TResponse> _responseMarshaller;
        private readonly IChannel<TResponse> _inMessageBuffer = new BufferedChannel<TResponse>(1);
        private readonly IChannel<TRequest> _outMessageBuffer = new BufferedChannel<TRequest>(1);
        private readonly IChannel<(IInvocationMessage Header, Maybe<TRequest> Body)> _sendQueue
            = new BufferedChannel<(IInvocationMessage, Maybe<TRequest>)>(3);
        private readonly MemoryStream _curIncomingMessage = new MemoryStream();
        private readonly MemoryStream _curOutcomingMessage = new MemoryStream();
        private readonly InvocationMessageHandler<Nothing, Nothing> _incomingHandler;
        private readonly Promise _startCompletion = new Promise();
        private IncomingStreamState _incomingStreamState;
        private long _sentMessageCount;
        private long _receivedConfirmationCount;

        protected Invocation(
            ITransportChannel channel,
            IProtocolImplementation protocol,
            IMarshaller<TRequest> requestMarshaller,
            IMarshaller<TResponse> responseMarshaller)
        {
            _log = LogManager.GetLogger<Invocation<TRequest, TResponse>>(channel.Id.ToString());
            _channel = channel;
            _protocol = protocol;
            _requestMarshaller = requestMarshaller;
            _responseMarshaller = responseMarshaller;
            _incomingHandler = new InvocationMessageHandler<Nothing, Nothing>(
                HandleIncomingMessageHeader,
                HandleIncomingConfirmation,
                HandleIncomingCompletion);
            Completion.LogCompletion(_log);
        }

        public UniqueId Id => _channel.Id;

        public IWritableChannel<TRequest> Out => _outMessageBuffer.Out;
        
        public bool TryTerminate(Exception error = null)
        {
            return _sendQueue.Out.TryTerminate(error);
        }

        public IReadableChannel<TResponse> In => _inMessageBuffer.In;

        protected abstract Task InitializeSendingAsync();

        protected abstract Task InitializeReceivingAsync();

        protected override async Task<Task> StartCoreAsync()
        {
            var process = TaskRunner.RunInBackground(ProcessAsync);
            await _startCompletion.Task.ConfigureAwait(false);
            return process;
        }

        private async Task ProcessAsync()
        {
            try
            {
                _log.Trace("Starting processing invocation");
                await InitializeSendingAsync().ConfigureAwait(false);
                var processSendingTask = ProcessSendingAsync();
                var processOutMessagesTask = ProcessOutcomingMessagesAsync();
                await InitializeReceivingAsync().ConfigureAwait(false);
                var processReceivingTask = ProcessReceivingAsync();
                _startCompletion.TryComplete();
                try
                {
                    await Task.WhenAll(processOutMessagesTask, _inMessageBuffer.Out.Completion).ConfigureAwait(false);
                    _log.Trace("Message send/receive completed");
                    _sendQueue.Out.TryComplete();
                }
                catch (Exception ex)
                {
                    _log.Debug("Terminating invocation because of exception on message send/receive: {0}",
                        ex.FormatTypeAndMessage());
                    _sendQueue.Out.TryTerminate(ex);
                }
                await processSendingTask.ConfigureAwait(false);
                _log.Trace("Completing channel");
                _channel.Out.TryComplete();
                await processReceivingTask.ConfigureAwait(false);
                if (_receivedConfirmationCount != _sentMessageCount)
                {
                    throw new InvalidOperationException(
                        $"Count of sent messages {_sentMessageCount} not equal to the count of received confirmations {_receivedConfirmationCount}");
                }
            }
            catch (Exception ex)
            {
                _log.Debug("Invocation terminated: {0}", ex.FormatTypeAndMessage());
                _startCompletion.TryFail(ex);
                _channel.Out.TryTerminate(ex);
                _inMessageBuffer.Out.TryTerminate(ex);
                _outMessageBuffer.Out.TryTerminate(ex);
                _sendQueue.Out.TryTerminate(ex);
                await _channel.In
                    .ConsumeAsync((Action<TransportMessageFrame>)Dispose)
                    .IgnoreExceptions()
                    .ConfigureAwait(false);
                await _outMessageBuffer.In.ConsumeAsync((Action<TRequest>)Dispose)
                    .IgnoreExceptions()
                    .ConfigureAwait(false);
                await _sendQueue.In.ConsumeAsync((Action<(IInvocationMessage, Maybe<TRequest>)>)Dispose)
                    .IgnoreExceptions()
                    .ConfigureAwait(false);
                throw;
            }
            finally
            {
                _log.Trace("Waiting for transport channel completion");
                await _channel.Completion.IgnoreExceptions().ConfigureAwait(false);
                _log.Trace("Transport channel completed");
            }
            _log.Debug("invocation completed");
        }

        private async Task ProcessOutcomingMessagesAsync()
        {
            try
            {
                await _outMessageBuffer.In.ConsumeAsync(ScheduleRequestAsync).ConfigureAwait(false);
                var completion = _protocol.MessageFactory.CreateInvocationSendCompletion();
                await EnqueueHeaderAsync(completion).ConfigureAwait(false);
                _log.Debug("Outcoming message stream completed");
            }
            catch (Exception ex)
            {
                _log.Debug("Outcoming message stream terminated: {0}", ex.FormatTypeAndMessage());
                _outMessageBuffer.Out.TryTerminate(ex);
                _sendQueue.Out.TryTerminate(ex);
                await _outMessageBuffer.In.ConsumeAsync((Action<TRequest>)Dispose).IgnoreExceptions().ConfigureAwait(false);
                throw;
            }
        }

        private Task ScheduleRequestAsync(TRequest request)
        {
            return _sendQueue.Out.WriteAsync((_protocol.MessageFactory.CreateInvocationMessageHeader(), request));
        }

        private async Task ProcessSendingAsync()
        {
            try
            {
                await _sendQueue.In.ConsumeAsync(SendAsync).ConfigureAwait(false);
                _log.Trace("Sending completed");
            }
            catch (Exception ex)
            {
                _log.Debug("Sending terminated: {0}", ex.FormatTypeAndMessage());
                _inMessageBuffer.Out.TryTerminate(ex);
                _outMessageBuffer.Out.TryTerminate(ex);
                _sendQueue.Out.TryTerminate(ex);
                await _sendQueue.In.ConsumeAsync((Action<(IInvocationMessage, Maybe<TRequest>)>)Dispose).IgnoreExceptions().ConfigureAwait(false);
                throw;
            }
        }

        private async Task ProcessReceivingAsync()
        {
            try
            {
                await _channel.In.ConsumeAsync(HandleIncomingFrameAsync).ConfigureAwait(false);
                if (_incomingStreamState != IncomingStreamState.Completed)
                {
                    throw new InvalidOperationException($"Incoming stream closed unexpectedly in state {_incomingStreamState}");
                }
                _log.Trace("Receiving completed");
            }
            catch (Exception ex)
            {
                _log.Debug("Receiving terminated: {0}", ex.FormatTypeAndMessage());
                _inMessageBuffer.Out.TryTerminate(ex);
                _outMessageBuffer.Out.TryTerminate(ex);
                throw;
            }
        }

        private async Task SendAsync((IInvocationMessage Header, Maybe<TRequest> Body) msg)
        {
            await SendHeaderAsync(msg.Header).ConfigureAwait(false);

            if (!msg.Body.HasValue)
            {
                return;
            }

            if (msg.Body.HasValue)
            {
                await SerializeAndSendRequestAsync(msg.Body.Value).ConfigureAwait(false);
            }
        }

        private async Task SerializeAndSendRequestAsync(TRequest msg)
        {
            _log.Debug("Sending message");

            _curOutcomingMessage.Position = 0;
            _curOutcomingMessage.SetLength(0);
            _requestMarshaller.Encode(msg, _curOutcomingMessage);
            var length = _curOutcomingMessage.Position;
            long sentBytes = 0;
            _curOutcomingMessage.Position = 0;
            bool isLastFrameInMessage;
            do
            {
                int frameLength = (int)(length - sentBytes);
                if (frameLength > PooledBuffer.MaxSize)
                {
                    frameLength = PooledBuffer.MaxSize;
                    isLastFrameInMessage = false;
                }
                else
                {
                    isLastFrameInMessage = true;
                }
                var payload = await PooledBuffer.Get(_curOutcomingMessage, frameLength).ConfigureAwait(false);
                _sentMessageCount++;
                try
                {
                    var frame = new TransportMessageFrame(payload, !isLastFrameInMessage);
                    _log.Trace("Sending frame of message of type {0}: {1}", msg.GetType().Name, frame);
                    await _channel.Out.WriteAsync(frame).ConfigureAwait(false);
                }
                catch
                {
                    _sentMessageCount--;
                    payload.Dispose();
                    throw;
                }
                sentBytes += frameLength;
            } while (!isLastFrameInMessage);
            _curOutcomingMessage.Position = 0;
            _curIncomingMessage.SetLength(0);
            _log.Debug("Sent message of type {0}", msg.GetType().Name);
        }

        private static void Dispose(TransportMessageFrame obj)
        {
            obj.Dispose();
        }

        private static void Dispose(TRequest msg)
        {
        }

        private static void Dispose((IInvocationMessage Header, Maybe<TRequest> Body) msg)
        {
            msg.Header.Dispose();
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
                var msg = _responseMarshaller.Decode(_curIncomingMessage);
                _log.Debug("Received message of type {0} with length {1}", msg.GetType().Name, _curIncomingMessage.Length);
                await _inMessageBuffer.Out.WriteAsync(msg).ConfigureAwait(false);
                _curIncomingMessage.Position = 0;
                _curIncomingMessage.SetLength(0);
                _incomingStreamState = IncomingStreamState.Open;
                await EnqueueHeaderAsync(_protocol.MessageFactory.CreateInvocationMessageReceived()).ConfigureAwait(false);
            }
        }

        private Nothing HandleIncomingCompletion(IInvocationSendCompleted completion, Nothing _)
        {
            switch (_incomingStreamState)
            {
                case IncomingStreamState.Open:
                    _log.Trace("Incoming message stream completed");
                    _incomingStreamState = IncomingStreamState.Completed;
                    _inMessageBuffer.Out.TryComplete();
                    break;
                case IncomingStreamState.ReceivingMessage:
                case IncomingStreamState.Completed:
                    throw new InvalidOperationException($"Received unexpected message when in state {_incomingStreamState}: {completion}");
            }
            return Nothing.Instance;
        }

        private Nothing HandleIncomingConfirmation(IInvocationMessageReceived confirmation, Nothing _)
        {
            _receivedConfirmationCount++;
            if (_receivedConfirmationCount > _sentMessageCount)
            {
                throw new InvalidOperationException($"Received {_receivedConfirmationCount} confirmations when sent only {_sentMessageCount} messages");
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

        private async Task EnqueueHeaderAsync(IInvocationMessage header)
        {
            try
            {
                _log.Trace("Enqueing header for sending: {0}", header);
                await _sendQueue.Out.WriteAsync((header, Maybe<TRequest>.Nothing)).ConfigureAwait(false);
            }
            catch
            {
                header.Dispose();
                throw;
            }
        }

        private async Task SendHeaderAsync(IInvocationMessage header)
        {
            using (header)
            {
                var serialized = _protocol.Serializer.Serialize(header);
                try
                {
                    _log.Trace("Sending header: {0}", header);
                    var message = new TransportMessageFrame(serialized);
                    await _channel.Out.WriteAsync(message).ConfigureAwait(false);
                    _log.Trace("Sent header: {0}", header);
                }
                catch (Exception ex)
                {
                    _log.Trace("Terminated sending of header {0}: {1}", header, ex.FormatTypeAndMessage());
                    serialized.Dispose();
                    throw;
                }
            }
        }

        private enum IncomingStreamState
        {
            Open,
            ReceivingMessage,
            Completed
        }
    }
}
