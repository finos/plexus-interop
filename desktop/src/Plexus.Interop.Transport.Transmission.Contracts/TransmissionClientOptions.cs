namespace Plexus.Interop.Transport.Transmission
{
    using System.Threading;

    public sealed class TransmissionClientOptions
    {
        public TransmissionClientOptions(string brokerWorkingDir)
        {
            BrokerWorkingDir = brokerWorkingDir;
        }

        public string BrokerWorkingDir { get; set; }

        public CancellationToken CancellationToken { get; set; } = CancellationToken.None;
    }
}
