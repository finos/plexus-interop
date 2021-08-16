namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps.Internal.Generated;

    internal interface IAppLifecycleManagerClientClientRepository
    {
        IObservable<AppLifecycleManagerClient> GetClientObservable();
        Task<AppLifecycleManagerClient> GetClientAsync();
    }
}