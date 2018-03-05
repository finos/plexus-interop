namespace Plexus.Interop
{
    using System.Threading.Tasks;

    public interface IBroker
    {
        Task Completion { get; }

        Task StartAsync();
        void Stop();
    }
}
