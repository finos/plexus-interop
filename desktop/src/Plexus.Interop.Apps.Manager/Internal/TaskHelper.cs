namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Threading.Tasks;

    internal static class TaskHelper
    {
        public static Task CompletedTask
        {
            get
            {
#if NET45
                return Task.FromResult<object>(null);
#else
                return Task.CompletedTask;
#endif
            }
        }

#pragma warning disable 1998
        public static async Task FromException(Exception exception)
#pragma warning restore 1998
        {
            throw exception;
        }
    }
}
