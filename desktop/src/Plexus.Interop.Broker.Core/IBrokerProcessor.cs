namespace Plexus.Interop.Broker
{
    using System.Threading.Tasks;

    public interface IBrokerProcessor
    {
        Task Completion { get; }

        Task StartAsync();
    }
}
