namespace Plexus.Interop
{
    using System;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;

    public interface IClientFactory
    {
        IClient Create(
            string appId, 
            ITransportClient transport, 
            IProtocolImplementation protocol, 
            IMarshallerProvider marshaller, 
            Func<ClientOptionsBuilder, ClientOptionsBuilder> setup = null);
    }
}
