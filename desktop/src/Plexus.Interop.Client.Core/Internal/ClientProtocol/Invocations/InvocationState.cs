namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using System;

    internal sealed class InvocationState
    {
        public long SentCount { get; private set; }

        public long ConfirmationsCount { get; private set; }

        public bool ConfirmationsCompleted { get; private set; }

        public void OnMessageSent()
        {
            SentCount++;
            if (ConfirmationsCompleted && SentCount > ConfirmationsCount)
            {
                throw new InvalidOperationException($"Received confirmations count {ConfirmationsCount} < sent messages count {SentCount}");
            }
        }

        public void OnConfirmationReceived()
        {
            ConfirmationsCount++;
            if (ConfirmationsCount > SentCount)
            {
                throw new InvalidOperationException($"Received confirmations count {ConfirmationsCount} > sent messages count {SentCount}");
            }
        }

        public void OnIncomingStreamCompleted()
        {
            ConfirmationsCompleted = true;
            if (ConfirmationsCount != SentCount)
            {
                throw new InvalidOperationException($"Received confirmations count {ConfirmationsCount} != sent messages count {SentCount}");
            }
        }
    }
}
