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
using System.Threading.Tasks;

namespace Plexus.Channels
{
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

        public static async Task WriteAsync<T>(this IWriteOnlyChannel<T> channel, T item)
        {
            var result = await channel.TryWriteAsync(item).ConfigureAwait(false);
            if (!result)
            {
                await channel.Completion.ConfigureAwait(false);
                throw new OperationCanceledException();
            }
        }

        public static async ValueTask<T> ReadAsync<T>(this IReadableChannel<T> channel)
        {
            var result = await channel.TryReadAsync().ConfigureAwait(false);
            if (!result.HasValue)
            {
                await channel.Completion.ConfigureAwait(false);
                throw new OperationCanceledException();
            }
            return result.Value;
        }

        public static async ValueTask<Maybe<T>> TryReadSafeAsync<T>(this IReadableChannel<T> channel)
        {
            T result;
            while (!channel.TryReadSafe(out result))
            {
                if (!await channel.WaitForNextSafeAsync().ConfigureAwait(false))
                {
                    return Maybe<T>.Nothing;
                }
            }
            return new Maybe<T>(result);
        }

        public static async ValueTask<Maybe<T>> TryReadAsync<T>(this IReadableChannel<T> channel)
        {
            var result = await channel.TryReadSafeAsync().ConfigureAwait(false);
            if (result.HasValue)
            {
                return result;
            }
            await channel.Completion.ConfigureAwait(false);
            return result;
        }

        public static async Task<bool> TryWriteAsync<T>(this IWriteOnlyChannel<T> channel, T item)
        {
            var result = await channel.TryWriteSafeAsync(item).ConfigureAwait(false);
            if (!result)
            {
                await channel.Completion.ConfigureAwait(false);
            }
            return result;
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

        public static bool IsCompleted<T>(this IReadableChannel<T> channel)
        {
            return channel.Completion.IsCompleted;
        }

        public static bool IsCompleted<T>(this IWritableChannel<T> channel)
        {
            return channel.Completion.IsCompleted;
        }

        public static Task ConsumeAsync<T>(
            this IReadableChannel<T> channel,
            Action<T> handle,
            Func<Task> onCompletedAsync = null,
            Func<Exception, Task> onTerminatedAsync = null)
        {
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
            return channel.ConsumeAsync(async x => handle(x));
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        }

        public static async Task ConsumeAsync<T>(
            this IReadableChannel<T> channel,
            Func<T, Task> handleAsync,
            Func<Task> onCompletedAsync = null,
            Func<Exception, Task> onTerminatedAsync = null)
        {
            try
            {
                while (true)
                {
                    if (!channel.TryReadSafe(out T item))
                    {
                        var result = await channel.TryReadAsync().ConfigureAwait(false);
                        if (!result.HasValue)
                        {
                            break;
                        }
                        item = result.Value;
                    }
                    await handleAsync(item).ConfigureAwait(false);
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

        public static async Task ConsumeBufferAsync<T>(
            this IChannel<T> channel,
            Func<T, Task> handleAsync,
            Action<T> disposeAfterTermination)
        {
            try
            {
                await channel.In.ConsumeAsync(handleAsync).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                channel.Out.TryTerminate(ex);
                if (!channel.In.IsCompleted())
                {
                    try
                    {
                        await channel.In.ConsumeAsync(disposeAfterTermination).ConfigureAwait(false);
                    }
                    catch
                    {
                        // ignore
                    }
                }
                throw;
            }
            finally
            {
                await channel.In.Completion.ConfigureAwait(false);
            }
        }
    }
}
