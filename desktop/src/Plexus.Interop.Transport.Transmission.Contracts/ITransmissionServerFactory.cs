namespace Plexus.Interop.Transport.Transmission
{
    public interface ITransmissionServerFactory
    {
        ITransmissionServer Create(TransmissionServerOptions options);
    }
}
