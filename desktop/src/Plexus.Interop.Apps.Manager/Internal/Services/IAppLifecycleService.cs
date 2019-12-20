namespace Plexus.Interop.Apps.Internal.Services
{
    using Plexus.Interop.Apps.Internal.Generated;

    internal interface IAppLifecycleService : IInvocationEventProvider, AppLifecycleManagerClient.IAppLifecycleServiceImpl
    {
    }
}