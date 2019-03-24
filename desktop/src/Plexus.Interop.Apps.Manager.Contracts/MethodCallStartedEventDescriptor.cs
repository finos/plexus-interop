namespace Plexus.Interop.Apps
{
    public sealed class MethodCallStartedEventDescriptor
    {
        public MethodCallStartedEventDescriptor(MethodCallDescriptor methodCallDescriptor)
        {
            MethodCallDescriptor = methodCallDescriptor;
        }

        public MethodCallDescriptor MethodCallDescriptor { get; }

        public override string ToString()
        {
            return $"{nameof(MethodCallDescriptor)}: {{{MethodCallDescriptor}}}";
        }
    }
}
