/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
﻿using Plexus.Interop.Protocol.Common;
using Plexus.Interop.Transport.Protocol.Internal;

namespace Plexus.Interop.Transport.Protocol
{
    public sealed class TransportHeaderPool : ITransportHeaderFactory
    {
        public static readonly TransportHeaderPool Instance = new TransportHeaderPool();

        public ITransportChannelCloseHeader CreateChannelCloseHeader(UniqueId channelId, CompletionHeader completion)
        {
            var header = TransportChannelCloseHeader.Rent();
            header.ChannelId = channelId;
            header.Completion = completion;
            return header;
        }

        public ITransportChannelOpenHeader CreateChannelOpenHeader(UniqueId channelId)
        {
            var header = TransportChannelOpenHeader.Rent();
            header.ChannelId = channelId;
            return header;
        }

        public ITransportConnectionCloseHeader CreateConnectionCloseHeader(CompletionHeader completion)
        {
            var header = TransportConnectionCloseHeader.Rent();
            header.Completion = completion;
            return header;
        }

        public ITransportConnectionOpenHeader CreateConnectionOpenHeader(UniqueId connectionId)
        {
            var header = TransportConnectionOpenHeader.Rent();
            header.ConnectionId = connectionId;
            return header;
        }

        public ITransportFrameHeader CreateFrameHeader(UniqueId channelId, bool hasMore, int length)
        {
            var header = TransportFrameHeader.Rent();
            header.ChannelId = channelId;
            header.HasMore = hasMore;
            header.Length = length;
            return header;
        }
    }
}
