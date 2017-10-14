namespace Plexus.Interop.Transport.Transmission.Pipes
{
    using Plexus.Interop.Transport.Transmission.Pipes.Internal;

    public sealed class PipeTransmissionClientFactory : ITransmissionClientFactory
    {
        public ITransmissionClient Create(TransmissionClientOptions options)
        {
            return new PipeTransmissionClient(options);
        }
    }
}
