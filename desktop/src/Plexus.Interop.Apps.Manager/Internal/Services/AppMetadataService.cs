namespace Plexus.Interop.Apps.Internal.Services
{
    using System;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Metamodel;

    internal class AppMetadataService : IAppMetadataService
    {
        private readonly IAppRegistryProvider _appRegistryProvider;
        private readonly IRegistryProvider _registryProvider;

        public AppMetadataService(IAppRegistryProvider appRegistryProvider, IRegistryProvider registryProvider)
        {
            _appRegistryProvider = appRegistryProvider;
            _registryProvider = registryProvider;
        }

        public Task<AppMetadataChangedEvent> GetAppMetadataChangedEventStream(Empty request, MethodCallContext context)
        {
            throw new NotImplementedException();
        }

        public Task<MetamodelChangedEvent> GetMetamodelChangedEventStream(Empty request, MethodCallContext context)
        {
            throw new NotImplementedException();
        }
    }
}
