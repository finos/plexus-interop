/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Reactive;
    using System.Reactive.Linq;
    using System.Reactive.Threading.Tasks;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Channels;

    public static class ObservableExtensions
    {
        public static Task PipeAsync<T>(
            this IObservable<T> observable,
            IWritableChannel<T> writableChannel,
            CancellationToken cancellationToken = default(CancellationToken),
            TimeSpan sendTimeout = default(TimeSpan))
        {
            return observable
                .SelectMany(arg => WriteAsync(writableChannel, arg, cancellationToken, sendTimeout).ToObservable())
                .Concat(Observable.Return(Unit.Default))
                .ToTask(cancellationToken);
        }

        private static async Task WriteAsync<T>(
            IWritableChannel<T> channel,
            T arg,
            CancellationToken cancellationToken,
            TimeSpan sendTimeout)
        {
            using (var timeoutCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken))
            {
                if (sendTimeout > TimeSpan.Zero)
                {
                    // Cancel sending after timeout
                    timeoutCancellation.CancelAfter(sendTimeout);
                }

                await channel.WriteAsync(arg, timeoutCancellation.Token).ConfigureAwait(false);
            }
        }

        public static Task PipeAsync<T>(
            this IReadableChannel<T> readableChannel,
            IObserver<T> observer,
            CancellationToken cancellationToken = default(CancellationToken),
            bool sendCompete = false,
            bool sendException = false)
        {
            return readableChannel.ConsumeAsync(obj => observer.OnNext(obj), cancellationToken, () =>
            {
                if (sendCompete)
                {
                    observer.OnCompleted();
                }
                return TaskHelper.CompletedTask;
            }, exception =>
            {
                if (sendException)
                {
                    observer.OnError(exception);
                }
                return TaskHelper.FromException(exception);
            });
        }
    }
}
