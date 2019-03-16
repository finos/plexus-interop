using System;
using System.Collections.Generic;

namespace Plexus
{
    using System.Threading.Tasks;
    using Xunit;

    public sealed class PromiseTests : IDisposable
    {
        [Fact]
        public void NoUnobservedExceptionsOnPromise()
        {
            var promise = new Promise();
            promise.TryFail(new Exception("NoUnobservedExceptionsOnPromise!"));
        }

        [Fact]
        public void NoUnobservedExceptionsOnGenericPromise()
        {
            var promise = new Promise<bool>();
            promise.TryFail(new Exception("NoUnobservedExceptionsOnGenericPromise!"));
        }

        [Fact]
        public void NoUnobservedTaskExceptionsAfterCompletionLogged()
        {
            var promise = new Promise();            
            promise.Task.LogCompletion(LogManager.GetLogger<PromiseTests>());
            promise.TryFail(new Exception("NoUnobservedTaskExceptionsAfterCompletionLogged!"));
        }

        private static void VerifyNoUnobservedTaskExceptions()
        {
            var list = new List<Exception>();

            void CatchUnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs args)
            {
                lock (list)
                {
                    list.Add(args.Exception);
                }
            }

            TaskScheduler.UnobservedTaskException += CatchUnobservedTaskException;
            try
            {
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                if (list.Count > 0)
                {
                    throw new AggregateException(list);
                }
            }
            finally
            {
                TaskScheduler.UnobservedTaskException -= CatchUnobservedTaskException;
            }
        }

        public void Dispose()
        {
            VerifyNoUnobservedTaskExceptions();
        }
    }
}