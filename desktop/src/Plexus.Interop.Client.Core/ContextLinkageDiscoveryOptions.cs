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
namespace Plexus.Interop
{
    using Plexus.Interop.Protocol;

    public sealed class ContextLinkageDiscoveryOptions
    {
        public ContextLinkageDiscoveryOptions(string specifiedContextId)
        {
            SpecifiedContextId = new Maybe<string>(specifiedContextId);
            Mode = ContextLinkageDiscoveryMode.SpecificContext;
        }

        private ContextLinkageDiscoveryOptions(ContextLinkageDiscoveryMode mode)
        {
            Mode = mode;
            SpecifiedContextId = Maybe<string>.Nothing;
        }

        public static ContextLinkageDiscoveryOptions WithCurrentContext() => new ContextLinkageDiscoveryOptions(ContextLinkageDiscoveryMode.CurrentContext);

        public ContextLinkageDiscoveryMode Mode { get; }

        public Maybe<string> SpecifiedContextId { get; }
    }
}
