namespace Plexus.Interop.Testing
{
    public delegate IClient TestClientFactory(ITestBroker targetBroker, UniqueId appInstanceId);
}
