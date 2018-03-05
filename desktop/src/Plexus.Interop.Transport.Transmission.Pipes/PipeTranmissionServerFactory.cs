namespace Plexus.Interop.Transport.Transmission.Pipes
{
    using Plexus.Interop.Transport.Transmission.Pipes.Internal;

    public sealed class PipeTransmissionServerFactory
    {
        public static PipeTransmissionServerFactory Instance = new PipeTransmissionServerFactory();

        public ITransmissionServer Create(string brokerWorkingDir)
        {
            return new PipeTransmissionServer(brokerWorkingDir);
        }
    }
}
