namespace Plexus.Interop.Transport
{
    using System.Threading;

    public interface ITransportClientFactory
    {
        ITransportClient Create(string brokerWorkingDir, CancellationToken cancellationToken);
    }
}
