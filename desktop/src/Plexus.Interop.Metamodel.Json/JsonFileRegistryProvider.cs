/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Metamodel.Json
{
    using System;
    using System.IO;
    using System.Threading;

    public sealed class JsonRegistryProvider : IRegistryProvider, IDisposable
    {
        private static readonly ILogger Log = LogManager.GetLogger<JsonRegistryProvider>();

        private readonly string _jsonFileName;
        private readonly FileSystemWatcher _watcher;
        public IRegistry Current { get; private set; }

        public event Action<IRegistry> Updated = registry => { };

        private readonly object _timerLock = new object();
        private volatile Timer _reloadTimer;

        public static JsonRegistryProvider Initialize(string jsonFileName)
        {
            jsonFileName = Path.GetFullPath(jsonFileName);
            var registry = LoadRegistry(jsonFileName);
            return new JsonRegistryProvider(registry, jsonFileName);
        }

        private JsonRegistryProvider(IRegistry registry, string jsonFileName)
        {
            _jsonFileName = Path.GetFullPath(jsonFileName);            
            var jsonFileDirectory = Path.GetDirectoryName(_jsonFileName) ?? throw new InvalidOperationException();
            Current = registry;
            _watcher = new FileSystemWatcher(jsonFileDirectory)
            {
                EnableRaisingEvents = true,
                Filter = Path.GetFileName(_jsonFileName),
                NotifyFilter = NotifyFilters.LastWrite,               
            };
            _watcher.Changed += OnFileChanged;
        }


        public void Dispose()
        {
            _watcher.Dispose();
        }
        
        private void OnFileChanged(object sender, FileSystemEventArgs e)
        {
            try
            {
                if (e.ChangeType == WatcherChangeTypes.Changed && string.Equals(e.FullPath, _jsonFileName))
                {
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
                Updated(Current);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception during loading interop registry from {0}", _jsonFileName);
            }
        }

        private static IRegistry LoadRegistry(string jsonFileName)
        {
            return JsonRegistry.LoadRegistry(jsonFileName);
        }
    }
}
