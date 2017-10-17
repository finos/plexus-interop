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
namespace Plexus.Interop.Transport.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Transport.Protocol;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using Plexus.Pools;
    using System.Threading.Tasks;

    internal sealed class TransportReceiveProcessor : ITransportReceiveProcessor
    {
        private readonly ILogger _log;
        private readonly IMessagingReceiveProcessor _receiveProcessor;
        private readonly TransportConnectionStateValidator _stateValidator = new TransportConnectionStateValidator();
        private readonly TransportHeaderHandler<Task, (Maybe<IPooledBuffer>, IWriteOnlyChannel<ChannelMessage>)> _handler;
        private readonly BufferedChannel<ChannelMessage> _buffer = new BufferedChannel<ChannelMessage>(3);

        public TransportReceiveProcessor(
            ITransmissionConnection connection,
            ITransportProtocolDeserializer deserializer)
        {
            InstanceId = connection.Id;
            _log = LogManager.GetLogger<TransportReceiveProcessor>(InstanceId.ToString());
            _receiveProcessor = new MessagingReceiveProcessor(connection, deserializer);
            _handler = new TransportHeaderHandler<Task, (Maybe<IPooledBuffer>, IWriteOnlyChannel<ChannelMessage>)>(
                HandleConnetionHeaderAsync,
                HandleChannelHeaderAsync);
            _buffer.Out.PropagateCompletionFrom(TaskRunner.RunInBackground(ReceveLoopAsync));
            In.Completion.LogCompletion(_log);
        }

        public UniqueId InstanceId { get; }

        public IReadOnlyChannel<ChannelMessage> In => _buffer.In;

        private async Task ReceveLoopAsync()
        {
            await _receiveProcessor.In.ConsumeAsync(HandleReceivedAsync).ConfigureAwait(false);
            _stateValidator.OnCompleted();
        }

        private async Task HandleReceivedAsync(TransportMessage message)
        {
            try
            {
                _stateValidator.OnMessage(message.Header);
                await message.Header.Handle(_handler, (message.Payload, _buffer.Out)).ConfigureAwait(false);
            }
            catch
            {
                message.Dispose();
                throw;
            }
        }

        private static async Task HandleChannelHeaderAsync(
            ITransportChannelHeader header, 
            (Maybe<IPooledBuffer> Payload, IWriteOnlyChannel<ChannelMessage> Output) args)
        {
            var message = new ChannelMessage(header, args.Payload);
            try
            {
                await args.Output.WriteAsync(message).ConfigureAwait(false);
            }
            catch
            {
                message.Dispose();
                throw;
            }
        }

        private static Task HandleConnetionHeaderAsync(
            ITransportConnectionHeader header, 
            (Maybe<IPooledBuffer> Payload, IWriteOnlyChannel<ChannelMessage> Output) args)
        {
            return TaskConstants.Completed;
        }
    }
}
