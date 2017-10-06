namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Metamodel.Json;
    using System;
    using System.Reflection;

    internal sealed class BrokerRegistryProvider : IRegistryProvider, IDisposable
    {
        private readonly IRegistryProvider _baseRegistryProvider;
        private readonly IRegistry _embeddedRegistry;

        public BrokerRegistryProvider(IRegistryProvider baseRegistryProvider)
        {
            _baseRegistryProvider = baseRegistryProvider;
            var type = typeof(BrokerRegistryProvider);
            _embeddedRegistry = JsonRegistry.LoadRegistry(
                type.GetTypeInfo().Assembly.GetManifestResourceStream(type.Namespace + ".interop.json"));
            Current = _embeddedRegistry.MergeWith(baseRegistryProvider.Current);
            _baseRegistryProvider.Updated += OnUpdated;
        }

        public IRegistry Current { get; private set; }

        public event Action<IRegistry> Updated = registry => { };

        private void OnUpdated(IRegistry registry)
        {
            Current = _embeddedRegistry.MergeWith(registry);
            Updated(Current);
        }

        public void Dispose()
        {
            _baseRegistryProvider.Updated -= OnUpdated;
        }
    }
}
