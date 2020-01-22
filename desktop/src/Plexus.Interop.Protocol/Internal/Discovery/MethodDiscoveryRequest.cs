/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Protocol.Internal.Discovery
{
    using Plexus.Interop.Protocol.Discovery;
    using Plexus.Pools;

    internal sealed class MethodDiscoveryRequest : PooledObject<MethodDiscoveryRequest>, IMethodDiscoveryRequest
    {
        protected override void Cleanup()
        {
            InputMessageId = default;
            OutputMessageId = default;
            DiscoveryMode = default;
            if (ConsumedMethod.HasValue)
            {
                ConsumedMethod.GetValueOrDefault()?.Dispose();
            }
            ContextLinkageOptions = default;
            ConsumedMethod = default;
        }

        public T Handle<T, TArgs>(ClientToBrokerRequestHandler<T, TArgs> handler, TArgs args = default)
        {
            return handler.Handle(this, args);
        }

        public Maybe<string> InputMessageId { get; set; }

        public Maybe<string> OutputMessageId { get; set; }

        public Maybe<IConsumedMethodReference> ConsumedMethod { get; set; }

        public DiscoveryMode DiscoveryMode { get; set; }

        public IContextLinkageOptions ContextLinkageOptions { get; set; }

        public override string ToString()
        {
            return $"{nameof(InputMessageId)}: {InputMessageId}, {nameof(OutputMessageId)}: {OutputMessageId}, {nameof(ConsumedMethod)}: {{{ConsumedMethod}}}, {nameof(DiscoveryMode)}: {DiscoveryMode}";
        }
    }
}
