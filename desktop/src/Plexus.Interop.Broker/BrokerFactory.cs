namespace Plexus.Interop
{
    using Plexus.Interop.Metamodel;

    public sealed class BrokerFactory
    {
        public static BrokerFactory Instance = new BrokerFactory();

        public IBroker Create(string metadataDir = null, IRegistryProvider registryProvider = null)
        {
            return new Internal.Broker(metadataDir, registryProvider);
        }
    }
}
