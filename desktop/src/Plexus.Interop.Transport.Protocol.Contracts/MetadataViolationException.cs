using System;

namespace Plexus.Interop.Transport.Protocol
{
    public class MetadataViolationException : ProtocolException
    {
        public MetadataViolationException(string remoteMessage, Exception innerException = null) : base(remoteMessage, innerException)
        {
        }
    }
}
