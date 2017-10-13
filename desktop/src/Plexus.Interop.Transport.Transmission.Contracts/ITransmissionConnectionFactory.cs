namespace Plexus.Interop.Transport.Transmission
{
    using System.Threading.Tasks;

    public interface ITransmissionConnectionFactory
    {
        ValueTask<Maybe<ITransmissionConnection>> TryCreateAsync();

        ValueTask<ITransmissionConnection> CreateAsync();
    }
}
