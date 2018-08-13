namespace Plexus.Interop.Protocol.Internal
{
    using Plexus.Pools;

    internal sealed class Option : PooledObject<Option>, IOption
    {
        public string Id { get; set; }

        public string Value { get; set; }

        protected override void Cleanup()
        {
            Id = default;
            Value = default;
        }

        public override string ToString()
        {
            return $"{nameof(Id)}: {Id}, {nameof(Value)}: {Value}";
        }
    }
}
