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
 namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Transport;
    using Plexus.Pools;
    using Plexus.Processes;
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class InvocationSendProcessor<TRequest> : ProcessBase, ITerminatableWritableChannel<IInvocationMessage>
    {        
        private readonly ILogger _log;

        private readonly MemoryStream _curOutcomingMessage = new MemoryStream();

        private readonly BufferedChannel<TRequest> _requestBuffer = new BufferedChannel<TRequest>(1);

        private readonly BufferedChannel<(IInvocationMessage Header, Maybe<TRequest> Body)> _buffer
            = new BufferedChannel<(IInvocationMessage, Maybe<TRequest>)>(10);

        private readonly IWritableChannel<TransportMessageFrame> _transport;
        private readonly IMarshaller<TRequest> _marshaller;
        private readonly InvocationState _invocationState;
        private readonly IProtocolImplementation _protocol;
        private readonly Promise _requestCompletion = new Promise();
        private readonly Stopwatch _sendWaitTimer = new Stopwatch();

        public InvocationSendProcessor(
            UniqueId id,
            IWritableChannel<TransportMessageFrame> transport,
            IProtocolImplementation protocol,
            IMarshaller<TRequest> marshaller, 
            InvocationState invocationState)
        {
            _log = LogManager.GetLogger<InvocationSendProcessor<TRequest>>(id.ToString());
            _transport = transport;
            _marshaller = marshaller;
            _invocationState = invocationState;
            _protocol = protocol;
            _requestBuffer.PropagateCompletionFrom(_buffer.Out.Completion);
        }

        protected override ILogger Log => _log;

        public ITerminatableWritableChannel<TRequest> RequestStream => _requestBuffer.Out;

        public Task RequestCompletion => _requestCompletion.Task;

        protected override Task<Task> StartCoreAsync()
        {
            return Task.FromResult(ProcessAsync());
        }

        private Task ProcessAsync()
        {
            _requestCompletion.PropagateCompletionFrom(ProcessRequestsAsync());
            return Task.WhenAll(_requestCompletion.Task, ProcessMessagesAsync());
        }

        private async Task ProcessRequestsAsync()
        {
            try
            {
                await _requestBuffer.In.ConsumeAsync(SendRequestAsync, CancellationToken).ConfigureAwait(false);
                await this.WriteOrDisposeAsync(_protocol.MessageFactory.CreateInvocationSendCompletion(), CancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _requestBuffer.Out.TryTerminate(ex);
                _requestBuffer.In.ConsumeBufferedItems(x => { });
                _buffer.Out.TryTerminate(ex);
                throw;
            }
        }

        private async Task ProcessMessagesAsync()
        {
            try
            {
                await _buffer.In.ConsumeAsync(SendAsync, CancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _buffer.Out.TryTerminate(ex);
                _buffer.In.ConsumeBufferedItems(x => x.Header.Dispose());
                _requestBuffer.Out.TryTerminate(ex);
                _requestBuffer.In.ConsumeBufferedItems(x => { });
                throw;
            }
            finally
            {
                await _buffer.In.Completion.ConfigureAwait(false);
            }
        }

        private async Task SendRequestAsync(TRequest request)
        {
            var task = _invocationState.OnBeforeMessageSendAsync();
            if (!task.IsCompleted)
            {                
                Log.Debug("Waiting until send allowed");
                _sendWaitTimer.Restart();
                await task.ConfigureAwait(false);
                _sendWaitTimer.Stop();
                Log.Debug("Proceeding with sending after waiting {0}ms", _sendWaitTimer.ElapsedMilliseconds);
            }
            Log.Trace("Sending message: {0}", _invocationState);
            var header = _protocol.MessageFactory.CreateInvocationMessageHeader();
            try
            {
                await _buffer.Out.WriteAsync((header, request), CancellationToken).ConfigureAwait(false);
            }
            catch
            {
                header.Dispose();
                throw;
            }
        }

        private async Task SendAsync((IInvocationMessage Header, Maybe<TRequest> Body) msg)
        {
            await SendHeaderAsync(msg.Header).ConfigureAwait(false);

            if (msg.Body.HasValue)
            {
                await SerializeAndSendRequestBodyAsync(msg.Body.Value).ConfigureAwait(false);
            }
        }

        private async Task SerializeAndSendRequestBodyAsync(TRequest msg)
        {
            _log.Debug("Sending message");

            _curOutcomingMessage.Position = 0;
            _curOutcomingMessage.SetLength(0);
            _marshaller.Encode(msg, _curOutcomingMessage);
            var length = _curOutcomingMessage.Position;
            long sentBytes = 0;
            _curOutcomingMessage.Position = 0;
            bool isLastFrameInMessage;
            do
            {
                var frameLength = (int)(length - sentBytes);
                if (frameLength > PooledBuffer.MaxSize)
                {
                    frameLength = PooledBuffer.MaxSize;
                    isLastFrameInMessage = false;
                }
                else
                {
                    isLastFrameInMessage = true;
                }
                var payload = await PooledBuffer.Get(_curOutcomingMessage, frameLength, CancellationToken).ConfigureAwait(false);                
                try
                {
                    var frame = new TransportMessageFrame(payload, !isLastFrameInMessage);
                    _log.Trace("Sending frame of message of type {0}: {1}", msg.GetType().Name, frame);
                    await _transport.WriteAsync(frame, CancellationToken).ConfigureAwait(false);
                }
                catch
                {
                    payload.Dispose();
                    throw;
                }                
                sentBytes += frameLength;
            } while (!isLastFrameInMessage);
            _curOutcomingMessage.Position = 0;
            _curOutcomingMessage.SetLength(0);            

            _log.Debug("Sent message of type {0}", msg.GetType().Name);
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
                    await _transport.WriteAsync(message, CancellationToken).ConfigureAwait(false);
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

        public bool TryWrite(IInvocationMessage item)
        {
            return _buffer.TryWrite((item, Maybe<TRequest>.Nothing));
        }

        public Task<bool> WaitWriteAvailableAsync(CancellationToken cancellationToken = default)
        {
            using (var cancellation = CancellationTokenSource.CreateLinkedTokenSource(CancellationToken, cancellationToken))
            {
                return _buffer.WaitWriteAvailableAsync(cancellation.Token);
            }
        }

        public bool TryComplete()
        {
            return _buffer.TryComplete();
        }

        public bool TryTerminate(Exception error = null)
        {
            return _buffer.TryTerminate(error);
        }
    }
}
