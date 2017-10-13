namespace Plexus.Interop.Transport.Internal
{
    using Plexus.Interop.Transport.Protocol;
    using Plexus.Interop.Transport.Protocol.Serialization;
    using Plexus.Interop.Transport.Transmission;
    using System;

    internal sealed class TransportConnectionFactory
    {
        private static readonly ILogger Log = LogManager.GetLogger<TransportConnectionFactory>();

        private readonly ITransportProtocolSerializer _serializer;
        private readonly ITransportProtocolDeserializer _deserializer;

        public TransportConnectionFactory(ITransportProtocolSerializationProvider serializationProvider)
        {
            _serializer = serializationProvider.GetSerializer();
            _deserializer = serializationProvider.GetDeserializer(TransportHeaderPool.Instance);
        }

        public ITransportConnection Create(ITransmissionConnection transmissionConnection)
        {
            try
            {
                var sender = new TransportSendProcessor(transmissionConnection, TransportHeaderPool.Instance, _serializer);
                var receiver = new TransportReceiveProcessor(transmissionConnection, _deserializer);
                var connection = new TransportConnection(sender, receiver, TransportHeaderPool.Instance);
                Log.Trace("New connection created: {0}", connection.Id);
                return connection;
            }
            catch (Exception ex)
            {
                Log.Trace("Connection failed: {0}", ex.FormatTypeAndMessage());
                transmissionConnection.Dispose();
                throw;
            }
        }
    }
}
