namespace Plexus
{
    using System;
    using System.Runtime.CompilerServices;
    using System.Threading;
    using System.Threading.Tasks;

    internal struct AwaitableCancellationToken<T> : IDisposable
    {
        private readonly Task<T> _task;
        private readonly CancellationTokenRegistration _registration;

        public AwaitableCancellationToken(CancellationToken cancellationToken)
        {
            if (cancellationToken.CanBeCanceled)
            {
                var promise = new Promise<T>();
                _task = promise.Task;
                _registration = promise.AssignCancellationToken(cancellationToken);
            }
            else if (cancellationToken.IsCancellationRequested)
            {
                _task = TaskConstants<T>.Canceled;
                _registration = default;
            }
            else
            {
                _task = TaskConstants<T>.Infinite;
                _registration = default;
            }
        }

        public Task<T> AsTask()
        {
            return _task ?? TaskConstants<T>.Infinite;
        }

        public TaskAwaiter<T> GetAwaiter()
        {
            return _task.GetAwaiter();
        }

        public ConfiguredTaskAwaitable<T> ConfigureAwait(bool continueOnCapturedContext)
        {
            return _task.ConfigureAwait(continueOnCapturedContext);
        }

        public void Dispose()
        {
            _registration.Dispose();
        }
    }
}
