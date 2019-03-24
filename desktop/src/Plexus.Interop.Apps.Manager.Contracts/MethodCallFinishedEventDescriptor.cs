namespace Plexus.Interop.Apps
{
    public sealed class MethodCallFinishedEventDescriptor
    {
        public MethodCallFinishedEventDescriptor(
            MethodCallDescriptor methodCallDescriptor, 
            MethodCallResult result, 
            long durationMs)
        {
            MethodCallDescriptor = methodCallDescriptor;
            Result = result;
            DurationMs = durationMs;
        }

        public MethodCallDescriptor MethodCallDescriptor { get; }
        public MethodCallResult Result { get; }
        public long DurationMs { get; }

        public override string ToString()
        {
            return $"{nameof(MethodCallDescriptor)}: {MethodCallDescriptor}, {nameof(Result)}: {Result}, {nameof(DurationMs)}: {DurationMs}";
        }
    }
}
