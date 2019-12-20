namespace Plexus.Interop.Apps
{
    using System.Threading.Tasks;
    using Plexus.Interop.Metamodel;

    public interface IInteropContext
    {
        Task StartAsync();
        Task StopAsync();

        IRegistryProvider RegistryProvider { get; }
        IAppLifecycleManager AppLifecycleManager { get; }
        IInvocationEventProvider InvocationEventProvider { get; }
    }
}