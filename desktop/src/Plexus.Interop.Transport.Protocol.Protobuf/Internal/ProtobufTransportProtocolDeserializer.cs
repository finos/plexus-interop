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
﻿using System;
using Plexus.Interop.Protobuf;
using Plexus.Interop.Transport.Protocol.Serialization;
using Plexus.Pools;

namespace Plexus.Interop.Transport.Protocol.Protobuf.Internal
{
    internal sealed class ProtobufTransportProtocolDeserializer : ITransportProtocolDeserializer
    {
        private readonly ILogger _log;
        
        private readonly ITransportHeaderFactory _headerFactory;

        public ProtobufTransportProtocolDeserializer(ITransportHeaderFactory headerFactory)
        {
            _log = LogManager.GetLogger<ProtobufTransportProtocolDeserializer>();
            _headerFactory = headerFactory;
        }

        public ITransportHeader Deserialize(IPooledBuffer datagram)
        {
            using (var proto = Header.Rent())
            {
                proto.MergeFrom(datagram);
                var contentCase = proto.ContentCase;
                ITransportHeader header;
                switch (contentCase)
                {
                    case Header.ContentOneofCase.MessageFrame:
                        header = ConvertFromProto(proto.MessageFrame);
                        break;
                    case Header.ContentOneofCase.ChannelOpen:
                        header = ConvertFromProto(proto.ChannelOpen);
                        break;
                    case Header.ContentOneofCase.ChannelClose:
                        header = ConvertFromProto(proto.ChannelClose);
                        break;
                    case Header.ContentOneofCase.Open:
                        header = ConvertFromProto(proto.Open);
                        break;
                    case Header.ContentOneofCase.Close:
                        header = ConvertFromProto(proto.Close);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
                return header;
            }
        }

        private ITransportFrameHeader ConvertFromProto(MessageFrameHeader frameHeader)
        {
            return _headerFactory.CreateFrameHeader(
                frameHeader.ChannelId.ConvertFromProtoStrict(),
                frameHeader.HasMore,
                (int)frameHeader.Length);
        }

        private ITransportChannelCloseHeader ConvertFromProto(ChannelCloseHeader proto)
        {
            return _headerFactory.CreateChannelCloseHeader(proto.ChannelId.ConvertFromProtoStrict(), proto.Completion.ConvertFromProto());
        }

        private ITransportChannelOpenHeader ConvertFromProto(ChannelOpenHeader proto)
        {
            return _headerFactory.CreateChannelOpenHeader(proto.ChannelId.ConvertFromProtoStrict());
        }

        private ITransportConnectionOpenHeader ConvertFromProto(ConnectionOpenHeader proto)
        {
            return _headerFactory.CreateConnectionOpenHeader(proto.ConnectionId.ConvertFromProtoStrict());
        }

        private ITransportConnectionCloseHeader ConvertFromProto(ConnectionCloseHeader proto)
        {
            return _headerFactory.CreateConnectionCloseHeader(proto.Completion.ConvertFromProto());
        }
    }
}
