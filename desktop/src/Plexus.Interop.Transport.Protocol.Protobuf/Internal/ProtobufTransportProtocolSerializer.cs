/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
﻿using Plexus.Interop.Protobuf;
using Plexus.Interop.Transport.Protocol.Serialization;
using Plexus.Pools;

namespace Plexus.Interop.Transport.Protocol.Protobuf.Internal
{
    internal sealed class ProtobufTransportProtocolSerializer : ITransportProtocolSerializer
    {
        private readonly ILogger _log;

        private readonly TransportConnectionHeaderHandler<IPooledBuffer, Nothing> _connectionHeaderHandler;
        private readonly TransportHeaderHandler<IPooledBuffer, Nothing> _transportHeaderHandler;
        private readonly TransportChannelHeaderHandler<IPooledBuffer, Nothing> _channelHeaderHandler;

        public ProtobufTransportProtocolSerializer()
        {
            _log = LogManager.GetLogger<ProtobufTransportProtocolSerializer>();
            _transportHeaderHandler = new TransportHeaderHandler<IPooledBuffer, Nothing>(Handle, Handle);
            _channelHeaderHandler = new TransportChannelHeaderHandler<IPooledBuffer, Nothing>(Handle, Handle, Handle);
            _connectionHeaderHandler = new TransportConnectionHeaderHandler<IPooledBuffer, Nothing>(Handle, Handle);
        }

        public IPooledBuffer Serialize(ITransportHeader header)
        {
            return header.Handle(_transportHeaderHandler);
        }


        public IPooledBuffer Handle(ITransportConnectionHeader header, Nothing _)
        {
            return header.Handle(_connectionHeaderHandler);
        }

        public IPooledBuffer Handle(ITransportChannelHeader header, Nothing _)
        {
            return header.Handle(_channelHeaderHandler);
        }

        public IPooledBuffer Handle(ITransportFrameHeader header, Nothing _)
        {
            using (var headerProto = Header.Rent())
            using (var frameProto = MessageFrameHeader.Rent())
            {
                headerProto.MessageFrame = MergeToProto(frameProto, header);
                return headerProto.Serialize();
            }
        }

        public IPooledBuffer Handle(ITransportChannelCloseHeader header, Nothing _)
        {
            using (var headerProto = Header.Rent())
            using (var channelCloseProto = ChannelCloseHeader.Rent())
            {
                headerProto.ChannelClose = MergeToProto(channelCloseProto, header);
                return headerProto.Serialize();
            }
        }

        public IPooledBuffer Handle(ITransportChannelOpenHeader header, Nothing _)
        {
            using (var headerProto = Header.Rent())
            using (var channelOpenProto = ChannelOpenHeader.Rent())
            {
                headerProto.ChannelOpen = MergeToProto(channelOpenProto, header);
                return headerProto.Serialize();
            }
        }

        public IPooledBuffer Handle(ITransportConnectionOpenHeader header, Nothing _)
        {
            using (var headerProto = Header.Rent())
            using (var openProto = ConnectionOpenHeader.Rent())
            {
                headerProto.Open = MergeToProto(openProto, header);
                return headerProto.Serialize();
            }
        }

        public IPooledBuffer Handle(ITransportConnectionCloseHeader header, Nothing _)
        {
            using (var headerProto = Header.Rent())
            using (var closeProto = ConnectionCloseHeader.Rent())
            {
                headerProto.Close = MergeToProto(closeProto, header);
                return headerProto.Serialize();
            }
        }

        private static MessageFrameHeader MergeToProto(MessageFrameHeader proto, ITransportFrameHeader frameMessageHeader)
        {
            proto = proto ?? new MessageFrameHeader();
            proto.ChannelId = proto.ChannelId.MergeFrom(frameMessageHeader.ChannelId);
            proto.Length = (uint)frameMessageHeader.Length;
            proto.HasMore = frameMessageHeader.HasMore;
            return proto;
        }

        private static ChannelCloseHeader MergeToProto(ChannelCloseHeader proto, ITransportChannelCloseHeader messageHeader)
        {
            proto = proto ?? new ChannelCloseHeader();
            proto.ChannelId = proto.ChannelId.MergeFrom(messageHeader.ChannelId);
            proto.Completion = proto.Completion.MergeFrom(messageHeader.Completion);
            return proto;
        }

        private static ChannelOpenHeader MergeToProto(ChannelOpenHeader proto, ITransportChannelOpenHeader messageHeader)
        {
            proto = proto ?? new ChannelOpenHeader();
            proto.ChannelId = proto.ChannelId.MergeFrom(messageHeader.ChannelId);
            return proto;
        }

        private static ConnectionOpenHeader MergeToProto(ConnectionOpenHeader proto, ITransportConnectionOpenHeader messageHeader)
        {
            proto = proto ?? new ConnectionOpenHeader();
            proto.ConnectionId = proto.ConnectionId.MergeFrom(messageHeader.ConnectionId);
            return proto;
        }

        private static ConnectionCloseHeader MergeToProto(ConnectionCloseHeader proto, ITransportConnectionCloseHeader messageHeader)
        {
            proto = proto ?? new ConnectionCloseHeader();
            proto.Completion = proto.Completion.MergeFrom(messageHeader.Completion);
            return proto;
        }
    }
}
