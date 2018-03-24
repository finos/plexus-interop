namespace Plexus.Interop.Apps
{
    public struct ResolvedConnection
    {
        public ResolvedConnection(IAppConnection appConnection, bool isNewInstance)
        {
            AppConnection = appConnection;
            IsNewInstance = isNewInstance;
        }

        public IAppConnection AppConnection { get; }

        public bool IsNewInstance { get; }
    }
}
