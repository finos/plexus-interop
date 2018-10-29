namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.IO;
    using System.Threading;

    internal sealed class JsonFileAppRegistryProvider : IAppRegistryProvider, IDisposable
    {
        private static readonly ILogger Log = LogManager.GetLogger<JsonFileAppRegistryProvider>();

        private readonly string _jsonFileName;
        private readonly FileSystemWatcher _watcher;
        public AppsDto Current { get; private set; }

        public event Action<AppsDto> Updated = registry => { };

        private readonly object _timerLock = new object();
        private volatile Timer _reloadTimer;

        public static JsonFileAppRegistryProvider Initialize(string jsonFileName)
        {
            jsonFileName = Path.GetFullPath(jsonFileName);
            var registry = LoadRegistry(jsonFileName);
            return new JsonFileAppRegistryProvider(registry, jsonFileName);
        }

        private JsonFileAppRegistryProvider(AppsDto registry, string jsonFileName)
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

        private static AppsDto LoadRegistry(string jsonFileName)
        {
            return AppsDto.Load(jsonFileName);
        }
    }
}