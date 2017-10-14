namespace Plexus.Interop.Transport.Transmission
{
    using System.IO;
    using System.Threading;

    public sealed class TransmissionServerOptions
    {
        public string BrokerWorkingDir { get; set; } = Directory.GetCurrentDirectory();

        public CancellationToken CancellationToken { get; set; } = CancellationToken.None;
    }
}
