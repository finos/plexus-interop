namespace Plexus.Interop.Apps
{
    using Plexus.Interop.Apps.Internal;

    public sealed class AppLifecycleManagerFactory
    {
        public static AppLifecycleManagerFactory Instance = new AppLifecycleManagerFactory();

        public IAppLifecycleManager Create(string metadataDir)
        {
            return new AppLifecycleManager(metadataDir);
        }
    }
}
