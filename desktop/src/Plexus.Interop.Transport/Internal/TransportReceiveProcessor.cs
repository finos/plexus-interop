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
﻿using System.Threading;
using Plexus.Pools;
using Plexus.Interop.Transport.Transmission;
using System.Threading.Tasks;
using Plexus.Channels;
using Plexus.Interop.Transport.Protocol;
using Plexus.Interop.Transport.Protocol.Serialization;

namespace Plexus.Interop.Transport.Internal
{
    internal sealed class TransportReceiveProcessor : ITransportReceiveProcessor
    {
        private readonly ILogger _log;
        private readonly IMessagingReceiveProcessor _receiveProcessor;
        private readonly TransportConnectionStateValidator _stateValidator = new TransportConnectionStateValidator();
        private readonly TransportHeaderHandler<Task, (Maybe<IPooledBuffer>, IWriteOnlyChannel<ChannelMessage>)> _handler;

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
            In = new ProducingChannel<ChannelMessage>(3, ReceveLoopAsync);
            In.Completion.LogCompletion(_log);
        }

        public UniqueId InstanceId { get; }

        public IReadableChannel<ChannelMessage> In { get; }

        private void Dispose(TransportMessage message)
        {
            _log.Trace("Disposing {0}", message);
            message.Dispose();
        }

        private async Task ReceveLoopAsync(IWriteOnlyChannel<ChannelMessage> output, CancellationToken cancellationToken)
        {
            while (true)
            {
                var received = await _receiveProcessor.In.TryReadAsync().ConfigureAwait(false);
                if (!received.HasValue)
                {
                    break;
                }
                var message = received.Value;
                try
                {
                    _stateValidator.OnMessage(message.Header);
                    await message.Header.Handle(_handler, (message.Payload, output)).ConfigureAwait(false);
                }
                catch
                {
                    message.Dispose();
                    throw;
                }
            }
            _stateValidator.OnCompleted();
        }

        private async Task HandleChannelHeaderAsync(ITransportChannelHeader header, (Maybe<IPooledBuffer> Payload, IWriteOnlyChannel<ChannelMessage> Output) args)
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

        private Task HandleConnetionHeaderAsync(ITransportConnectionHeader header, (Maybe<IPooledBuffer> Payload, IWriteOnlyChannel<ChannelMessage> Output) args)
        {
            return TaskConstants.Completed;
        }
    }
}
