namespace Plexus.Interop.Apps
{
    public class AppLaunchedAndConnected
    {
        public AppLaunchedAndConnected(UniqueId appInstanceId, string appId, IAppConnection appConnection, AppConnectionDescriptor referrerConnectionInfo)
        {
            AppInstanceId = appInstanceId;
            AppId = appId;
            AppConnection = appConnection;
            ReferrerConnectionInfo = referrerConnectionInfo;
        }

        public UniqueId AppInstanceId { get; }

        public string AppId { get; }

        public IAppConnection AppConnection { get; }

        public AppConnectionDescriptor ReferrerConnectionInfo { get; }
    }
}