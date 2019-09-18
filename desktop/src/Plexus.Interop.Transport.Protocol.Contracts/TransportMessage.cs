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
﻿using System;
using System.Collections.Generic;
using Plexus.Pools;

namespace Plexus.Interop.Transport.Protocol
{
    public struct TransportMessage : IPooledObject
    {
        public TransportMessage(ITransportHeader header) : this(header, Maybe<IPooledBuffer>.Nothing)
        {
        }

        public TransportMessage(ITransportHeader header, Maybe<IPooledBuffer> payload)
        {
            Header = header;
            Payload = payload;
        }

        public ITransportHeader Header { get; }

        public Maybe<IPooledBuffer> Payload { get; }

        public void Retain()
        {
            Header.Retain();
            if (Payload.HasValue)
            {
                Payload.Value.Retain();
            }
        }

        public void Dispose()
        {
            Header.Dispose();
            if (Payload.HasValue)
            {
                Payload.Value.Dispose();
            }
        }

        public override bool Equals(object obj)
        {
            if (!(obj is TransportMessage))
            {
                return false;
            }

            var message = (TransportMessage)obj;
            return EqualityComparer<ITransportHeader>.Default.Equals(Header, message.Header) &&
                   Payload.Equals(message.Payload);
        }

        public override int GetHashCode()
        {
            var hashCode = 1268427973;
            hashCode = hashCode * -1521134295 + base.GetHashCode();
            hashCode = hashCode * -1521134295 + EqualityComparer<ITransportHeader>.Default.GetHashCode(Header);
            hashCode = hashCode * -1521134295 + EqualityComparer<Maybe<IPooledBuffer>>.Default.GetHashCode(Payload);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{{{nameof(Header)}: {Header}, {nameof(Payload)}: {Payload}}}";
        }
    }
}