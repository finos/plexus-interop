namespace Plexus.Interop.Transport.Transmission.Pipes
{
    using Plexus.Interop.Transport.Transmission.Pipes.Internal;

    public sealed class PipeTransmissionClientFactory
    {
        public static PipeTransmissionClientFactory Instance = new PipeTransmissionClientFactory();

        public ITransmissionClient Create()
        {
            return new PipeTransmissionClient();
        }
    }
}
