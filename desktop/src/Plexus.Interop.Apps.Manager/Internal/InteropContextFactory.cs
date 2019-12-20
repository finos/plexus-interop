namespace Plexus.Interop.Apps.Internal
{
    using Plexus.Interop.Metamodel;

    public sealed class InteropContextFactory
    {
        public static InteropContextFactory Instance = new InteropContextFactory();

        public IInteropContext Create(string metadataDir, IRegistryProvider registryProvider)
        {
            return new InteropContext(metadataDir, registryProvider);
        }
    }
}
