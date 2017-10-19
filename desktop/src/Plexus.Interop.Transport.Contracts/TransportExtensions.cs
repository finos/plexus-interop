/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Transport
{
    using System;
    using System.Threading.Tasks;

    public static class TransportExtensions
    {
        public static async ValueTask<Maybe<ITransportChannel>> TryCreateChannelAsync(this ITransportConnection connection)
        {
            var maybeChannel = await connection.TryCreateChannelSafeAsync().ConfigureAwait(false);
            if (!maybeChannel.HasValue)
            {
                await connection.Completion.ConfigureAwait(false);
            }
            return maybeChannel;
        }

        public static async ValueTask<ITransportChannel> CreateChannelAsync(this ITransportConnection connection)
        {
            var maybeChannel = await TryCreateChannelAsync(connection).ConfigureAwait(false);
            if (!maybeChannel.HasValue)
            {
                throw new OperationCanceledException();
            }
            return maybeChannel.Value;
        }

        public static async Task CompleteAsync(this ITransportConnection connection)
        {
            connection.TryComplete();
            do
            {
                while (connection.IncomingChannels.TryRead(out _))
                {
                }
            } while (await connection.IncomingChannels.WaitReadAvailableAsync().ConfigureAwait(false));
            await connection.Completion.ConfigureAwait(false);
        }
    }
}
