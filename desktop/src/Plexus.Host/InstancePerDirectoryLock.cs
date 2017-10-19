namespace Plexus.Host
{
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Text;
    using System.Threading;

    internal sealed class InstancePerDirectoryLock : IDisposable
    {
        private readonly string _lockFileName;
        private FileStream _fileStream;

        public InstancePerDirectoryLock(string lockName)
        {
            _lockFileName = string.Join("-", lockName, "lock");
        }

        public bool TryEnter(int timeoutMs)
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            do
            {
                try
                {
                    _fileStream = File.Open(_lockFileName, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Read);
                    var bytes = Encoding.UTF8.GetBytes(Process.GetCurrentProcess().Id.ToString());
                    _fileStream.Write(bytes, 0, bytes.Length);
                    _fileStream.Flush(true);
                }
                catch
                {
                    Thread.Sleep(50);
                }
            } while (_fileStream == null && stopwatch.ElapsedMilliseconds < timeoutMs);
            stopwatch.Stop();
            return _fileStream != null;
        }

        public void Release()
        {
            if (_fileStream == null)
            {
                return;
            }
            _fileStream.Dispose();
            try
            {
                if (File.Exists(_lockFileName))
                {
                    File.Delete(_lockFileName);
                }
            }
            catch
            {
                // ignore
            }
        }

        public void Dispose()
        {
            Release();
        }
    }
}
