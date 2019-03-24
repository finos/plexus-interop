namespace Plexus.Interop.Apps
{
    public sealed class MethodCallDescriptor
    {
        public MethodCallDescriptor(
            AppConnectionDescriptor sourceConnection, 
            AppConnectionDescriptor targetConnection, 
            string serviceId, 
            string serviceAlias, 
            string methodId)
        {
            SourceConnection = sourceConnection;
            TargetConnection = targetConnection;
            ServiceId = serviceId;
            ServiceAlias = serviceAlias;
            MethodId = methodId;
        }

        public AppConnectionDescriptor SourceConnection { get; }
        public AppConnectionDescriptor TargetConnection { get; }
        public string ServiceId { get; }
        public string ServiceAlias { get; }
        public string MethodId { get; }

        public override string ToString()
        {
            return $"{nameof(SourceConnection)}: {SourceConnection}, {nameof(TargetConnection)}: {TargetConnection}, {nameof(ServiceId)}: {ServiceId}, {nameof(ServiceAlias)}: {ServiceAlias}, {nameof(MethodId)}: {MethodId}";
        }
    }
}
