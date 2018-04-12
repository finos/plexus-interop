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
namespace Plexus.Channels
{
    using System;
    using System.Runtime.CompilerServices;
    using System.Threading;
    using System.Threading.Tasks;

    public static class ChannelExtensions
    {
        private static readonly Task CompletedTask;

        static ChannelExtensions()
        {
            var tcs = new TaskCompletionSource<Nothing>();
            tcs.SetResult(Nothing.Instance);
            CompletedTask = tcs.Task;
        }

        public static async Task CompleteAsync<T>(this ITerminatableWritableChannel<T> channel)
        {
            channel.TryComplete();
            await channel.Completion.ConfigureAwait(false);
        }

        public static async Task TerminateAsync<T>(this ITerminatableWritableChannel<T> channel, Exception error = null)
        {
            channel.TryTerminate(error);
            await channel.Completion.ConfigureAwait(false);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async Task WriteAsync<T>(this IWritableChannel<T> channel, T item, CancellationToken cancellationToken = default)
        {
            var result = await channel.TryWriteAsync(item, cancellationToken).ConfigureAwait(false);
            if (!result)
            {
                throw new OperationCanceledException();
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async Task WriteOrDisposeAsync<T>(this IWritableChannel<T> channel, T item, CancellationToken cancellationToken = default)
            where T : IDisposable
        {
            try
            {
                await channel.WriteAsync(item, cancellationToken).ConfigureAwait(false);
            }
            catch
            {
                item.Dispose();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async Task<bool> TryWriteAsync<T>(this IWritableChannel<T> channel, T item, CancellationToken cancellationToken = default)
        {
            do
            {
                if (channel.TryWrite(item))
                {
                    return true;
                }
            } while (await channel.WaitWriteAvailableAsync(cancellationToken).ConfigureAwait(false));
            return false;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async ValueTask<T> ReadAsync<T>(this IReadableChannel<T> channel, CancellationToken cancellationToken = default)
        {
            var result = await channel.TryReadAsync(cancellationToken).ConfigureAwait(false);
            if (!result.HasValue)
            {
                throw new OperationCanceledException();
            }
            return result.Value;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async ValueTask<Maybe<T>> TryReadAsync<T>(this IReadableChannel<T> channel, CancellationToken cancellationToken = default)
        {
            do
            {
                if (channel.TryRead(out var item))
                {
                    return item;
                }
            } while (await channel.WaitReadAvailableAsync(cancellationToken).ConfigureAwait(false));
            return Maybe<T>.Nothing;
        }
        
        public static void Terminate<T>(
            this ITerminatableWritableChannel<T> channel,
            Exception error = null)
        {
            if (!channel.TryTerminate(error))
            {
                throw new OperationCanceledException();
            }
        }

        public static void Complete<T>(this ITerminatableWritableChannel<T> channel)
        {
            if (!channel.TryComplete())
            {
                throw new OperationCanceledException();
            }
        }

        public static bool IsCompleted<T>(this IReadableChannel<T> channel)
        {
            return channel.Completion.IsCompleted;
        }

        public static bool IsCompleted<T>(this ITerminatableWritableChannel<T> channel)
        {
            return channel.Completion.IsCompleted;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task DisposeRemainingItemsAsync<T>(
            this IReadableChannel<T> channel) where T : IDisposable
        {
            return channel.ConsumeAsync(x => x.Dispose());
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void DisposeBufferedItems<T>(
            this IReadableChannel<T> channel) where T : IDisposable
        {
            channel.ConsumeBufferedItems(x => x.Dispose());
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static void ConsumeBufferedItems<T>(
            this IReadableChannel<T> channel, Action<T> handle)
        {
            while (channel.TryRead(out var item))
            {
                handle(item);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static Task ConsumeAsync<T>(
            this IReadableChannel<T> channel,
            Action<T> handle,
            CancellationToken cancellationToken = default,
            Func<Task> onCompletedAsync = null,
            Func<Exception, Task> onTerminatedAsync = null)
        {
            return channel.ConsumeAsync(
                x =>
                {
                    handle(x);
                    return CompletedTask;
                },
                cancellationToken,
                onCompletedAsync,
                onTerminatedAsync);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static async Task ConsumeAsync<T>(
            this IReadableChannel<T> channel,            
            Func<T, Task> handleAsync,
            CancellationToken cancellationToken = default,
            Func<Task> onCompletedAsync = null,
            Func<Exception, Task> onTerminatedAsync = null)
        {            
            try
            {
                do
                {
                    while (channel.TryRead(out var item))
                    {
                        await handleAsync(item).ConfigureAwait(false);
                    }
                } while (await channel.WaitReadAvailableAsync(cancellationToken).ConfigureAwait(false));

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
