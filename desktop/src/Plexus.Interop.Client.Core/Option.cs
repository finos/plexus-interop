namespace Plexus.Interop
{
    public sealed class Option
    {
        internal Option(string id, string value)
        {
            Id = id;
            Value = value;
        }

        public string Id { get; }

        public string Value { get; }

        public override string ToString()
        {
            return $"{nameof(Id)}: {Id}, {nameof(Value)}: {Value}";
        }
    }
}
