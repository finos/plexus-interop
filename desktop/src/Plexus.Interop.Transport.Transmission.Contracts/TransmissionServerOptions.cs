namespace Plexus.Interop.Transport.Transmission
{
    using System.IO;
    using System.Threading;

    public sealed class TransmissionServerOptions
    {
        public TransmissionServerOptions() : this (Directory.GetCurrentDirectory())
        {
        }

        public TransmissionServerOptions(string brokerWorkingDir)
        {
            BrokerWorkingDir = brokerWorkingDir;
        }

        public string BrokerWorkingDir { get; set; }

        public CancellationToken CancellationToken { get; set; } = CancellationToken.None;
    }
}
