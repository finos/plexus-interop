namespace Plexus.Interop.Transport
{
    using System.Threading.Tasks;

    public interface ITransportConnectionFactory
    {
        ValueTask<Maybe<ITransportConnection>> TryCreateAsync();

        ValueTask<ITransportConnection> CreateAsync();
    }
}
