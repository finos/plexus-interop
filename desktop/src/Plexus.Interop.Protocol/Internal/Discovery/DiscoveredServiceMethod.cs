/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Protocol.Internal.Discovery
{
    using Plexus.Interop.Protocol.Discovery;
    using Plexus.Pools;

    internal sealed class DiscoveredServiceMethod : PooledObject<DiscoveredServiceMethod>, IDiscoveredServiceMethod
    {
        public string MethodId { get; set; }

        public Maybe<string> MethodTitle { get; set; }

        public string InputMessageId { get; set; }

        public string OutputMessageId { get; set; }

        public MethodType MethodType { get; set; }

        public override string ToString()
        {
            return $"{nameof(MethodId)}: {MethodId}, {nameof(MethodTitle)}: {MethodTitle}, {nameof(InputMessageId)}: {InputMessageId}, {nameof(OutputMessageId)}: {OutputMessageId}, {nameof(MethodType)}: {MethodType}";
        }

        protected override void Cleanup()
        {
            MethodId = default;
            MethodTitle = default;
            InputMessageId = default;
            OutputMessageId = default;
            MethodType = default;
        }
    }
}
