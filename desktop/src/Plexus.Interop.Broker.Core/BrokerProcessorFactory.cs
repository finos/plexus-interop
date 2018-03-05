namespace Plexus.Interop.Broker
{
    using Plexus.Channels;
    using Plexus.Interop.Apps;
    using Plexus.Interop.Broker.Internal;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;

    public sealed class BrokerProcessorFactory
    {
        public static BrokerProcessorFactory Instance = new BrokerProcessorFactory();

        public IBrokerProcessor Create(
            IReadableChannel<ITransportConnection> incomingConnections, 
            IRegistryProvider registryProvider, 
            IProtocolSerializerFactory protocolSerializerFactory,
            IAppLifecycleManager appLifecycleManager)
        {
            return new BrokerProcessor(
                incomingConnections, 
                registryProvider, 
                protocolSerializerFactory,
                appLifecycleManager);
        }
    }
}
