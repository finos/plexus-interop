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
﻿namespace Plexus.Interop.Transport
{
    using Plexus.Channels;
    using Plexus.Pools;
    using System;
    using System.IO;
    using System.Threading.Tasks;

    public static class TransportChannelUtils
    {
        public static async Task<bool> TrySendAsync(this ITransportChannel channel, Stream content, long length)
        {
            long sentBytes = 0;
            bool isLastFrameInMessage;
            do
            {
                int frameLength = (int)(length - sentBytes);
                if (frameLength > PooledBuffer.MaxSize)
                {
                    frameLength = PooledBuffer.MaxSize;
                    isLastFrameInMessage = false;
                }
                else
                {
                    isLastFrameInMessage = true;
                }
                var payload = await PooledBuffer.Get(content, frameLength).ConfigureAwait(false);
                try
                {
                    var message = new TransportMessageFrame(payload, !isLastFrameInMessage);
                    if (!await channel.Out.TryWriteAsync(message).ConfigureAwait(false))
                    {
                        message.Dispose();
                        return false;
                    }
                }
                catch
                {
                    payload.Dispose();
                    throw;
                }
                sentBytes += frameLength;
            } while (!isLastFrameInMessage);
            return true;
        }

        public static async ValueTask<Maybe<long>> TryReceiveAsync(this ITransportChannel channel, Stream content)
        {
            long length = 0;
            bool hasMoreFrames;
            do
            {
                var result = await channel.In.TryReadAsync().ConfigureAwait(false);
                if (!result.HasValue)
                {
                    return Nothing.Instance;
                }
                using (var frame = result.Value)
                {
                    var payload = frame.Payload;
                    await content.WriteAsync(payload.Array, payload.Offset, payload.Count).ConfigureAwait(false);
                    length += payload.Count;
                    hasMoreFrames = frame.HasMore;
                }
            } while (hasMoreFrames);
            return length;
        }


        public static async Task SendAsync(this ITransportChannel channel, Stream content, long length)
        {
            if (!await channel.TrySendAsync(content, length).ConfigureAwait(false))
            {
                throw new OperationCanceledException();
            }
        }

        public static async ValueTask<long> ReceiveAsync(this ITransportChannel channel, Stream content, long length)
        {
            var result = await channel.TryReceiveAsync(content).ConfigureAwait(false);
            if (!result.HasValue)
            {
                throw new OperationCanceledException();
            }
            return result.Value;
        }

        public static async Task SendMessageAsync(
            this ITransportChannel channel,
            byte[] buffer,
            int offset,
            int count)
        {
            using (var stream = new MemoryStream(buffer, offset, count))
            {
                await channel.TrySendAsync(stream, count).ConfigureAwait(false);
            }
        }

        public static Task SendMessageAsync(
            this ITransportChannel channel,
            ArraySegment<byte> buffer)
        {
            return channel.SendMessageAsync(buffer.Array, buffer.Offset, buffer.Count);
        }

        public static Task SendMessageAsync(
            this ITransportChannel channel,
            byte[] buffer)
        {
            return channel.SendMessageAsync(buffer, 0, buffer.Length);
        }

        public static async Task<Maybe<byte[]>> TryReceiveMessageAsync(
            this ITransportChannel channel)
        {
            using (var stream = new MemoryStream())
            {
                var result = await channel.TryReceiveAsync(stream).ConfigureAwait(false);
                if (!result.HasValue)
                {
                    return Nothing.Instance;
                }
                return stream.ToArray();
            }
        }

        public static async Task<byte[]> ReceiveMessageAsync(
            this ITransportChannel channel)
        {
            using (var stream = new MemoryStream())
            {
                await channel.TryReceiveAsync(stream).ConfigureAwait(false);
                return stream.ToArray();
            }
        }

        public static async ValueTask<Maybe<long>> ReceiveMessageAsync(
            this ITransportChannel channel,
            byte[] buffer,
            int offset,
            int count)
        {
            using (var stream = new MemoryStream(buffer, offset, count, writable: true))
            {
                return await channel.TryReceiveAsync(stream).ConfigureAwait(false);
            }
        }

        public static ValueTask<Maybe<long>> ReceiveMessageAsync(
            this ITransportChannel channel,
            byte[] buffer)
        {
            return channel.ReceiveMessageAsync(buffer, 0, buffer.Length);
        }

        public static ValueTask<Maybe<long>> ReceiveMessageAsync(
            this ITransportChannel channel,
            ArraySegment<byte> buffer)
        {
            return channel.ReceiveMessageAsync(buffer.Array, buffer.Offset, buffer.Count);
        }
    }
}
