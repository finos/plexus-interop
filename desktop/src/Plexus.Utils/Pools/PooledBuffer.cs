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
using System.Buffers;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Plexus.Pools
{
    public sealed class PooledBuffer : PooledObject<PooledBuffer>, IPooledBuffer
    {
        public const int MaxSize = 65000;

        private static readonly ArrayPool<byte> ArrayPool = ArrayPool<byte>.Create(MaxSize, 50);

        public static async ValueTask<IPooledBuffer> Get(
            Stream fromStream,
            int length,
            CancellationToken cancellationToken = default)
        {
            if (length > MaxSize)
            {
                throw new ArgumentException($"Requested length {length} exceeds limit {MaxSize}", nameof(length));
            }
            var buffer = Rent();
            try
            {
                var count = 0;
                while (count < length)
                {
                    var received = await fromStream.ReadAsync(buffer.Array, count, length - count, cancellationToken).ConfigureAwait(false);
                    if (received == 0)
                    {
                        throw new InvalidOperationException("Unexpected end of stream received");
                    }
                    count += received;
                }
                buffer.Count = count;
                return buffer;
            }
            catch
            {
                buffer.Dispose();
                throw;
            }
        }

        public static IPooledBuffer Get(byte[] fromBuffer)
        {
            return Get(new ArraySegment<byte>(fromBuffer));
        }

        public static IPooledBuffer Get(ArraySegment<byte> fromBuffer)
        {
            var buffer = Rent();
            try
            {
                System.Array.Copy(fromBuffer.Array ?? throw new InvalidOperationException(), fromBuffer.Offset, buffer.Array, 0, fromBuffer.Count);
                buffer.Offset = fromBuffer.Offset;
                buffer.Count = fromBuffer.Count;
                return buffer;
            }
            catch
            {
                buffer.Dispose();
                throw;
            }
        }

        public static IPooledBuffer Get(Action<MemoryStream> writeAction)
        {
            var buffer = Rent();
            try
            {
                int length;
                using (var stream = new MemoryStream(buffer.Array, 0, MaxSize))
                {
                    writeAction(stream);
                    length = (int)stream.Position;
                }
                buffer.Count = length;
                return buffer;
            }
            catch
            {
                buffer.Dispose();
                throw;
            }
        }

        public byte[] Array { get; set; }

        public int Offset { get; set; }

        public int Count { get; set; }

        protected override void Cleanup()
        {
            if (Array != null)
            {
                ArrayPool.Return(Array);
            }
            Array = default;
            Offset = default;
            Count = default;
        }

        protected override void Init()
        {
            base.Init();
            Array = ArrayPool.Rent(MaxSize);
            Count = MaxSize;
            Offset = 0;            
        }

        public override string ToString()
        {
            return $"{{{nameof(Array)}: blob, {nameof(Offset)}: {Offset}, {nameof(Count)}: {Count}}}";
        }
    }
}
