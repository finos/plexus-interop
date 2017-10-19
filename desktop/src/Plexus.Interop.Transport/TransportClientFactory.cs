namespace Plexus.Interop.Transport
{
    using System.Threading;

    public sealed class TransportClientFactory : ITransportClientFactory
    {
        public ITransportClient Create(string brokerWorkingDir, CancellationToken cancellationToken)
        {
            throw new System.NotImplementedException();
        }
    }
}
