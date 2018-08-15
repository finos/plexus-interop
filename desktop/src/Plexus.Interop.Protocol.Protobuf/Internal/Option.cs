namespace Plexus.Interop.Protocol.Protobuf.Internal
{
    using Plexus.Pools;

    internal partial class Option : PooledObject<Option>, IOption
    {
        protected override void Cleanup()
        {
            Id = string.Empty;
            Value = string.Empty;
        }
    }
}
