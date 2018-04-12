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
namespace Plexus
{
    using System;
    using System.IO;
    using System.Runtime.CompilerServices;
    using System.Threading;
    using System.Threading.Tasks;

    internal static class StreamExtensions
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task WriteAsync(this Stream stream, ArraySegment<byte> buffer)
        {
            return stream.WriteAsync(buffer.Array, buffer.Offset, buffer.Count);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task WriteAsync(this Stream stream, ArraySegment<byte> buffer, CancellationToken cancellationToken)
        {
            return stream.WriteAsync(buffer.Array, buffer.Offset, buffer.Count, cancellationToken);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ReadAsync(this Stream stream, ArraySegment<byte> buffer)
        {
            return stream.ReadAsync(buffer.Array, buffer.Offset, buffer.Count);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ReadAsync(this Stream stream, ArraySegment<byte> buffer, CancellationToken cancellationToken)
        {
            return stream.ReadAsync(buffer.Array, buffer.Offset, buffer.Count, cancellationToken);
        }
    }
}
