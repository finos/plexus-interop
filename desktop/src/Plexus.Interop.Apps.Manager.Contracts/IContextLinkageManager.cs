namespace Plexus.Interop.Apps
{
    using System.Collections.Generic;
    using Plexus.Interop.Protocol;

    public interface IContextLinkageManager
    {
        bool IsContextShouldBeConsidered(IContextLinkageOptions contextLinkageOptions, IAppConnection sourceConnection);

        IReadOnlyCollection<(UniqueId AppInstanceId, string AppId, Maybe<UniqueId> ConnectionId)> GetAppsInContexts(IContextLinkageOptions contextLinkageOptions, IAppConnection sourceConnection, bool online);
    }
}