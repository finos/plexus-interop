namespace Plexus.Interop.Transport.Transmission
{
    public interface ITransmissionClientFactory
    {
        ITransmissionClient Create(TransmissionClientOptions options);
    }
}
