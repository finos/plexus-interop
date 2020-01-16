namespace Plexus.Interop.Apps
{
    using System.Collections.Generic;

    public interface IContextLinkageManager
    {
        IReadOnlyCollection<string> GetApplicationContexts(UniqueId applicationInstanceId);

        IReadOnlyCollection<(UniqueId AppInstanceId, string AppId, Maybe<UniqueId> ConnectionId)> GetAppsInContexts(IEnumerable<string> contextIds, bool online);
    }
}