namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Reactive;
    using System.Reactive.Linq;
    using System.Reactive.Threading.Tasks;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Channels;

    internal static class ObservableExtensions
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
