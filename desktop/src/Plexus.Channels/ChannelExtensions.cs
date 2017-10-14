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
namespace Plexus.Channels
{
    using System;
    using System.Threading;
    using System.Threading.Tasks;

    public static class ChannelExtensions
    {
        public static async Task CompleteAsync<T>(this IWritableChannel<T> channel)
        {
            channel.TryComplete();
            await channel.Completion.ConfigureAwait(false);
        }

        public static async Task TerminateAsync<T>(this IWritableChannel<T> channel, Exception error = null)
        {
            channel.TryTerminate(error);
            await channel.Completion.ConfigureAwait(false);
        }

        public static async Task WriteAsync<T>(this IWriteOnlyChannel<T> channel, T item, CancellationToken cancellationToken = default)
        {
            var result = await channel.TryWriteAsync(item, cancellationToken).ConfigureAwait(false);
            if (!result)
            {
                throw new OperationCanceledException();
            }
        }

        public static async Task<bool> TryWriteAsync<T>(this IWriteOnlyChannel<T> channel, T item, CancellationToken cancellationToken = default)
        {
            while (await channel.WaitWriteAvailableAsync(cancellationToken))
            {
                if (channel.TryWrite(item))
                {
                    return true;
                }
            }
            return false;
        }

        public static async ValueTask<T> ReadAsync<T>(this IReadOnlyChannel<T> channel, CancellationToken cancellationToken = default)
        {
            var result = await channel.TryReadAsync(cancellationToken).ConfigureAwait(false);
            if (!result.HasValue)
            {
                throw new OperationCanceledException();
            }
            return result.Value;
        }
        
        public static async ValueTask<Maybe<T>> TryReadAsync<T>(this IReadOnlyChannel<T> channel, CancellationToken cancellationToken = default)
        {
            while (await channel.WaitReadAvailableAsync(cancellationToken).ConfigureAwait(false))
            {
                if (channel.TryRead(out var item))
                {
                    return item;
                }
            }
            return Maybe<T>.Nothing;
        }
        
        public static void Terminate<T>(
            this IWritableChannel<T> channel,
            Exception error = null)
        {
            if (!channel.TryTerminate(error))
            {
                throw new OperationCanceledException();
            }
        }

        public static void Complete<T>(this IWritableChannel<T> channel)
        {
            if (!channel.TryComplete())
            {
                throw new OperationCanceledException();
            }
        }

        public static bool IsCompleted<T>(this IReadOnlyChannel<T> channel)
        {
            return channel.Completion.IsCompleted;
        }

        public static bool IsCompleted<T>(this IWritableChannel<T> channel)
        {
            return channel.Completion.IsCompleted;
        }

        public static async Task ConsumeAsync<T>(
            this IReadOnlyChannel<T> channel,            
            Func<T, Task> handleAsync,
            CancellationToken cancellationToken = default,
            Func<Task> onCompletedAsync = null,
            Func<Exception, Task> onTerminatedAsync = null)
        {
            try
            {
                while (await channel.WaitReadAvailableAsync(cancellationToken).ConfigureAwait(false))
                {
                    while (channel.TryRead(out var item))
                    {
                        await handleAsync(item).ConfigureAwait(false);
                    }
                }
                if (onCompletedAsync != null)
                {
                    await onCompletedAsync().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                if (onTerminatedAsync != null)
                {
                    await onTerminatedAsync(ex).ConfigureAwait(false);
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
