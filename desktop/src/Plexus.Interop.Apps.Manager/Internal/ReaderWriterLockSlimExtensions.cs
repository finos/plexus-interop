namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Threading;

    internal static class ReaderWriterLockSlimExtensions
    {
        public static void WithReadLock(this ReaderWriterLockSlim lockSlim, Action action)
        {
            bool locked = false;
            try
            {
                locked = lockSlim.TryEnterReadLock(-1);
                action();
            }
            finally
            {
                if (locked)
                {
                    lockSlim.ExitReadLock();
                }
            }
        }

        public static T WithReadLock<T>(this ReaderWriterLockSlim lockSlim, Func<T> func)
        {
            bool locked = false;
            try
            {
                locked = lockSlim.TryEnterReadLock(-1);
                return func();
            }
            finally
            {
                if (locked)
                {
                    lockSlim.ExitReadLock();
                }
            }
        }

        public static void WithWriteLock(this ReaderWriterLockSlim lockSlim, Action action)
        {
            bool locked = false;
            try
            {
                locked = lockSlim.TryEnterWriteLock(-1);
                action();
            }
            finally
            {
                if (locked)
                {
                    lockSlim.ExitReadLock();
                }
            }
        }

        public static T WithWriteLock<T>(this ReaderWriterLockSlim lockSlim, Func<T> func)
        {
            bool locked = false;
            try
            {
                locked = lockSlim.TryEnterWriteLock(-1);
                return func();
            }
            finally
            {
                if (locked)
                {
                    lockSlim.ExitReadLock();
                }
            }
        }
    }
}
