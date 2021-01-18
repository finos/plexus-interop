/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using System;
    using System.Threading.Tasks;
    using Plexus.Channels;

    internal sealed class InvocationState
    {
        private const int MaxPendingConfirmations = 3;

        private readonly BufferedChannel<Nothing> _pendingConfirmations = new BufferedChannel<Nothing>(MaxPendingConfirmations);

        public long SentCount { get; private set; }

        public long ConfirmationsCount { get; private set; }

        public bool ConfirmationsCompleted { get; private set; }

        public async Task OnBeforeMessageSendAsync()
        {
            if (ConfirmationsCompleted)
            {
                throw new InvalidOperationException("Cannot send when confirmations response stream completed");
            }

            if (!_pendingConfirmations.Out.TryWrite(Nothing.Instance))
            {
                await _pendingConfirmations.Out.WriteAsync(Nothing.Instance).ConfigureAwait(false);
            }

            if (ConfirmationsCompleted)
            {
                throw new InvalidOperationException("Cannot send when confirmations response stream completed");
            }

            SentCount++;
        }

        public void OnConfirmationReceived()
        {
            ConfirmationsCount++;
            if (!_pendingConfirmations.In.TryRead(out _))
            {
                throw new InvalidOperationException(
                    $"Unexpected confirmation received: confirmations count {ConfirmationsCount}, sent messages count {SentCount}");
            }
        }

        public void OnIncomingStreamCompleted()
        {
            ConfirmationsCompleted = true;
            if (ConfirmationsCount != SentCount)
            {
                throw new InvalidOperationException(
                    $"Received confirmations count {ConfirmationsCount} != sent messages count {SentCount}");
            }
        }

        public override string ToString()
        {
            return $"{nameof(SentCount)}: {SentCount}, {nameof(ConfirmationsCount)}: {ConfirmationsCount}, {nameof(ConfirmationsCompleted)}: {ConfirmationsCompleted}";
        }
    }
}
