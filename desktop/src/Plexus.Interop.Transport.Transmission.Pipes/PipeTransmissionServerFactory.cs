namespace Plexus.Interop.Transport.Transmission.Pipes
{
    using Plexus.Interop.Transport.Transmission.Pipes.Internal;

    public sealed class PipeTransmissionServerFactory : ITransmissionServerFactory
    {
        public ITransmissionServer Create(TransmissionServerOptions options)
        {
            return new PipeTransmissionServer(options);
        }
    }
}
