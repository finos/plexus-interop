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
namespace Plexus
{
    using System;
    using System.IO;
    using System.Security.Cryptography;
    using System.Text;
    using System.Threading;

    public abstract class BaseJsonFileRegistryProvider<T> : IDisposable
    {
        private static readonly ILogger Log = LogManager.GetLogger<BaseJsonFileRegistryProvider<T>>();

        public T Current { get; private set; }

        public event Action<T> Updated;

        private readonly string _jsonFileName;
        private readonly FileSystemWatcher _watcher;
        private readonly object _timerLock = new object();
        private volatile Timer _reloadTimer;

        protected BaseJsonFileRegistryProvider(string jsonFileName)
        {
            _jsonFileName = Path.GetFullPath(jsonFileName);

            var jsonFileDirectory = Path.GetDirectoryName(_jsonFileName) ?? throw new InvalidOperationException();
            Current = LoadRegistry(_jsonFileName);
            _watcher = new FileSystemWatcher(jsonFileDirectory)
            {
                EnableRaisingEvents = true,
                Filter = Path.GetFileName(_jsonFileName),
                NotifyFilter = NotifyFilters.LastWrite,
            };
            _watcher.Changed += OnFileChanged;
        }

        private void OnFileChanged(object sender, FileSystemEventArgs e)
        {
            try
            {
                if (e.ChangeType == WatcherChangeTypes.Changed && string.Equals(e.FullPath, _jsonFileName))
                {
                    Log.Info($"Registry file {_jsonFileName} have changed. Launching registry reload");
                    lock (_timerLock)
                    {
                        if (_reloadTimer == null)
                        {
                            _reloadTimer = new Timer(OnReloadTimerTick, null, TimeSpan.FromMilliseconds(100), Timeout.InfiniteTimeSpan);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception during handling change event of file {0}", _jsonFileName);
            }
        }

        private void OnReloadTimerTick(object state)
        {
            try
            {
                lock (_timerLock)
                {
                    _reloadTimer.Dispose();
                    _reloadTimer = null;
                }

                Current = LoadRegistry(_jsonFileName);
                Updated?.Invoke(Current);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception during loading interop registry from {0}", _jsonFileName);
            }
        }

        public void Dispose()
        {
            _watcher.Dispose();
        }

        public abstract T ParseRegistry(string registryContent);

        private T LoadRegistry(string jsonFileName)
        {
            Log.Info($"Loading registry from {jsonFileName}");

            using (var fileStream = File.Open(jsonFileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (var memoryStream = new MemoryStream())
            {
                T registry;
                fileStream.CopyTo(memoryStream);

                memoryStream.Position = 0;
                using (var reader = new StreamReader(memoryStream, Encoding.UTF8, true, 4096, true))
                {
                    var stringContent = reader.ReadToEnd();
                    registry = ParseRegistry(stringContent);
                }

                memoryStream.Position = 0;
                var sha1 = CalculateSha1(memoryStream);
                var creationTime = File.GetCreationTime(jsonFileName);
                var lastWriteTime = File.GetLastWriteTime(jsonFileName);
                var length = memoryStream.Length;

                Log.Info($"Successfully loaded registry from {jsonFileName}. CreationTime: {creationTime}; LastWriteTime: {lastWriteTime}; Length: {length}; SHA1: {sha1}");

                return registry;
            }
        }


        private string CalculateSha1(Stream stream)
        {
            try
            {
                using (var sha1 = SHA1.Create())
                {
                    var hash = sha1.ComputeHash(stream);
                    return ToHashString(hash);
                }
            }
            catch (Exception ex)
            {
                Log.Warn(ex, "Failed to calculate SHA1 hash");
                return string.Empty;
            }
        }

        private static string ToHashString(byte[] array)
        {
            if (array == null)
            {
                return null;
            }
            StringBuilder sb = new StringBuilder(array.Length * 2);
            foreach (byte bt in array)
            {
                sb.Append(bt.ToString("x2"));
            }

            return sb.ToString();
        }
    }
}
