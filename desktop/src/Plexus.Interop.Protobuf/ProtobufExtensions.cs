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
﻿using Google.Protobuf;
using Plexus.Pools;

namespace Plexus.Interop.Protobuf
{
    public static class ProtobufExtensions
    {
        public static IPooledBuffer Serialize(this IMessage message)
        {
            var buffer = PooledBuffer.Rent();
            var stream = new CodedOutputStream(buffer.Array);
            message.WriteTo(stream);
            stream.Flush();
            buffer.Count = (int)stream.Position;
            return buffer;
        }

        public static void MergeFrom<T>(this T message, IPooledBuffer datagram) where T : IMessage<T>
        {
            // We don't need to dispose stream here because it throws on disposing if created from array.
            var stream = new CodedInputStream(datagram.Array, datagram.Offset, datagram.Count);
            message.MergeFrom(stream);
        }
    }
}
