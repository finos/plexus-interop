namespace Plexus.Interop.Protocol
{
    public interface IOption : IProtocolMessage
    {
        string Id { get; }

        string Value { get; }
    }
}
