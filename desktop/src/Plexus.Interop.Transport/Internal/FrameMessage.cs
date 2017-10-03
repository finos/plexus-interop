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
﻿using System;
using Plexus.Pools;
using System.Collections.Generic;
using Plexus.Interop.Transport.Protocol;

namespace Plexus.Interop.Transport.Internal
{
    internal struct FrameMessage : IPooledObject
    {
        public FrameMessage(ITransportFrameHeader header, IPooledBuffer payload)
        {
            Header = header;
            Payload = payload;
        }

        public static implicit operator ChannelMessage(FrameMessage value)
        {
            return new ChannelMessage(value.Header, value.Payload);
        }

        public ITransportFrameHeader Header { get; }

        public IPooledBuffer Payload { get; }

        public void Retain()
        {
            Header.Retain();
            Payload.Retain();
        }

        public void Dispose()
        {
            Header.Dispose();
            Payload.Dispose();
        }

        public override bool Equals(object obj)
        {
            if (!(obj is FrameMessage))
            {
                return false;
            }

            var message = (FrameMessage)obj;
            return EqualityComparer<ITransportFrameHeader>.Default.Equals(Header, message.Header) &&
                   Payload.Equals(message.Payload);
        }

        public override int GetHashCode()
        {
            var hashCode = 1268427973;
            hashCode = hashCode * -1521134295 + base.GetHashCode();
            hashCode = hashCode * -1521134295 + EqualityComparer<ITransportFrameHeader>.Default.GetHashCode(Header);
            hashCode = hashCode * -1521134295 + EqualityComparer<IPooledBuffer>.Default.GetHashCode(Payload);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{{Type: {typeof(FrameMessage).Name}, {nameof(Header)}: {Header}, {nameof(Payload)}: {Payload}}}";
        }
    }
}
