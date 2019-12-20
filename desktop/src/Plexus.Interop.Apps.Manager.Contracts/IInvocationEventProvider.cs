namespace Plexus.Interop.Apps
{
    public interface IInvocationEventProvider
    {
        void OnInvocationStarted(InvocationStartedEventDescriptor eventData);

        void OnInvocationFinished(InvocationFinishedEventDescriptor eventData);
    }
}