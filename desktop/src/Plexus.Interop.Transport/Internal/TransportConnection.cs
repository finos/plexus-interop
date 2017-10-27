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

// ReSharper disable InconsistentlySynchronizedField
namespace Plexus.Interop.Transport.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Transport.Protocol;
    using System;
    using System.Collections.Concurrent;
    using System.Linq;
    using System.Threading.Tasks;

    internal sealed class TransportConnection : ITransportConnection
    {
        private readonly ILogger _log;
        private readonly ITransportSendProcessor _transportSendProcessor;
        private readonly ITransportReceiveProcessor _transportReceiveProcessor;
        private readonly ITransportHeaderFactory _headerFactory;
        private readonly IChannel<ITransportChannel> _incomingChannelQueue = new BufferedChannel<ITransportChannel>(3);
        private readonly TransportChannelHeaderHandler<Task, ChannelMessage> _incomingMessageHandler;
        private readonly ConcurrentDictionary<UniqueId, TransportChannel> _channels = new ConcurrentDictionary<UniqueId, TransportChannel>();
        private readonly Latch _sendCompletion = new Latch();

        public TransportConnection(
            ITransportSendProcessor transportSendProcessor,
            ITransportReceiveProcessor transportReceiveProcessor,
            ITransportHeaderFactory headerFactory)
        {
            Id = transportSendProcessor.InstanceId;
            _log = LogManager.GetLogger<TransportConnection>(Id.ToString());
            _transportSendProcessor = transportSendProcessor;
            _transportReceiveProcessor = transportReceiveProcessor;
            _headerFactory = headerFactory;
            _incomingMessageHandler = new TransportChannelHeaderHandler<Task, ChannelMessage>(HandleIncomingAsync, HandleIncomingAsync, HandleIncomingAsync);
            Completion = TaskRunner.RunInBackground(ProcessAsync).LogCompletion(_log);
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        public IReadOnlyChannel<ITransportChannel> IncomingChannels => _incomingChannelQueue.In;

        public bool TryComplete()
        {
            if (!_sendCompletion.TryEnter())
            {
                return false;
            }
            TaskRunner.RunInBackground(CompleteSendingAsync).IgnoreAwait(_log);
            return true;
        }

        public bool TryTerminate(Exception error = null)
        {
            if (!_sendCompletion.TryEnter())
            {
                return false;
            }
            TaskRunner.RunInBackground(() => TerminateSendingAsync(error)).IgnoreAwait(_log);
            return true;
        }

        public async ValueTask<Maybe<ITransportChannel>> TryCreateChannelSafeAsync()
        {
            if (_sendCompletion.IsEntered)
            {
                return Nothing.Instance;
            }
            return await TryCreateChannelSafeAsync(UniqueId.Generate());
        }

        private async ValueTask<Maybe<ITransportChannel>> TryCreateChannelSafeAsync(UniqueId channelId)
        {
            TransportChannel channel;
            lock (_channels)
            {
                if (_sendCompletion.IsEntered)
                {                    
                    return Nothing.Instance;
                }
                _log.Trace("Creating new channel by local request: {0}", channelId);
                channel = new TransportChannel(Id, channelId, _transportSendProcessor.Out, _headerFactory);
                _channels[channel.Id] = channel;
                channel.Completion.ContinueWithSynchronously((Action<Task, object>)OnChannelCompleted, channel).IgnoreAwait(_log);                
            }
            await channel.Initialized.ConfigureAwait(false);
            return channel;
        }

        private void OnChannelCompleted(Task completion, object state)
        {
            var channel = (TransportChannel)state;
            _channels.TryRemove(channel.Id, out _);
        }

        private async Task ProcessAsync()
        {
            Task receiveTask = TaskConstants.Completed;
            try
            {
                receiveTask = ReceiveAsync();
                await Task.WhenAny(receiveTask, _transportSendProcessor.Completion).Unwrap().ConfigureAwait(false);
                await CompleteSendingAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                await TerminateSendingAsync(ex).IgnoreExceptions().ConfigureAwait(false);
                throw;
            }
            finally
            {
                await Task.WhenAll(receiveTask, _transportSendProcessor.Completion).ConfigureAwait(false);
            }
        }

        private async Task ReceiveAsync()
        {
            try
            {
                await _transportReceiveProcessor.In.ConsumeAsync(HandleReceivedMessageAsync).ConfigureAwait(false);
                _incomingChannelQueue.Out.TryComplete();
                await CompleteReceivingAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _incomingChannelQueue.Out.TryTerminate(ex);
                await CompleteReceivingAsync(ex).ConfigureAwait(false);
                throw;
            }
        }

        private async Task CompleteReceivingAsync(Exception error = null)
        {
            Task completion;
            lock (_channels)
            {
                _log.Trace("Terminating receiving for {0} channels ({1}): {2}", _channels.Count, string.Join(", ", _channels.Keys), error.FormatTypeAndMessage());
                foreach (var channel in _channels.Values)
                {
                    channel.TerminateReceiving(error);
                }
                completion = Task.WhenAll(_channels.Values.Select(x => x.Completion)).IgnoreExceptions();
            }
            await completion.ConfigureAwait(false);
        }

        private async Task CompleteSendingAsync()
        {
            Task completion;
            lock (_channels)
            {
                _sendCompletion.TryEnter();
                _log.Trace("Completing sending for {0} channels", _channels.Count);
                foreach (var channel in _channels.Values)
                {
                    channel.Out.TryComplete();
                }
                completion = Task.WhenAll(_channels.Values.Select(x => x.Out.Completion)).IgnoreExceptions();
            }
            await completion.ConfigureAwait(false);
            _log.Trace("Sending completed for all channels");
            _transportSendProcessor.Out.TryComplete();
        }

        private async Task TerminateSendingAsync(Exception error = null)
        {            
            if (error is OperationCanceledException)
            {
                error = null;
            }
            Task completion;
            lock (_channels)
            {
                _sendCompletion.TryEnter();
                _log.Trace("Terminating sending for {0} channels: {1}", _channels.Count, error.FormatTypeAndMessage());
                foreach (var channel in _channels.Values)
                {
                    channel.Out.TryTerminate(error);
                }
                completion = Task.WhenAll(_channels.Values.Select(x => x.Out.Completion)).IgnoreExceptions();
            }
            await completion.ConfigureAwait(false);
            _transportSendProcessor.Out.TryTerminate(error);
        }

        private async Task HandleReceivedMessageAsync(ChannelMessage message)
        {
            _log.Trace("Handling received message {0}", message);
            await message.Header.Handle(_incomingMessageHandler, message).ConfigureAwait(false);
        }

        private async Task HandleIncomingAsync(ITransportFrameHeader header, ChannelMessage message)
        {
            if (_channels.TryGetValue(header.ChannelId, out var channel))
            {
                await channel.HandleIncomingAsync(message).ConfigureAwait(false);
            }
            else
            {
                _log.Trace("Skipping message because the specified channel not found: {0}", message);
                message.Dispose();
            }
        }

        private async Task HandleIncomingAsync(ITransportChannelCloseHeader header, ChannelMessage message)
        {
            if (_channels.TryGetValue(header.ChannelId, out var channel))
            {
                await channel.HandleIncomingAsync(message).ConfigureAwait(false);
            }
            else
            {
                _log.Trace("Skipping message because the specified channel not found: {0}", header);
                message.Dispose();
            }
        }

        private async Task HandleIncomingAsync(ITransportChannelOpenHeader header, ChannelMessage message)
        {
            using (message)
            {
                if (_sendCompletion.IsEntered)
                {
                    _log.Trace("Skipping message because termination is in progress: {0}", header);
                    return;
                }
                TransportChannel channel;
                lock (_channels)
                {
                    if (_channels.ContainsKey(header.ChannelId))
                    {
                        _log.Trace("Skipping message because the specified channel already exists: {0}", header);
                        return;
                    }
                    _log.Trace("Creating new channel by remote request: {0}", header);
                    channel = new TransportChannel(Id, header.ChannelId, _transportSendProcessor.Out, _headerFactory);
                    _channels[channel.Id] = channel;
                    channel.Completion.ContinueWithSynchronously((Action<Task, object>)OnChannelCompleted, channel).IgnoreAwait(_log);
                }
                await _incomingChannelQueue.Out.WriteAsync(channel).ConfigureAwait(false);
            }
        }

        public override string ToString()
        {
            return $"{{{nameof(Id)}: {Id}}}";
        }

        public void Dispose()
        {
            TryTerminate();
            Completion.IgnoreExceptions().GetResult();
        }
    }
}
