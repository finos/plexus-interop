namespace Plexus.Interop.Transport.Transmission.WebSockets.Server
{
    using Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal;

    public sealed class WebSocketTransmissionServerFactory
    {
        public static WebSocketTransmissionServerFactory Instance = new WebSocketTransmissionServerFactory();

        public ITransmissionServer Create(string workingDir)
        {
            return new WebSocketTransmissionServer(workingDir);
        }
    }
}
