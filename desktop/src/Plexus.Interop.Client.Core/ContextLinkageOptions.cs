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
namespace Plexus.Interop
{
    using Plexus.Interop.Protocol;

    public sealed class ContextLinkageOptions
    {
        public ContextLinkageOptions(string specifiedContextId)
        {
            SpecifiedContextId = new Maybe<string>(specifiedContextId);
            Mode = ContextLinkageDiscoveryMode.SpecificContext;
        }

        private ContextLinkageOptions(ContextLinkageDiscoveryMode mode)
        {
            Mode = mode;
            SpecifiedContextId = Maybe<string>.Nothing;
        }

        public static ContextLinkageOptions WithCurrentContext() => new ContextLinkageOptions(ContextLinkageDiscoveryMode.CurrentContext);

        public ContextLinkageDiscoveryMode Mode { get; }

        public Maybe<string> SpecifiedContextId { get; }
    }

    public static class ContextLinkageConvertor
    {
        public static IContextLinkageOptions Convert(this ContextLinkageOptions options, IProtocolMessageFactory messageFactory)
        {
            if (options == null)
            {
                return messageFactory.CreateContextLinkageOptions(ContextLinkageDiscoveryMode.None, Maybe<string>.Nothing);
            }

            return messageFactory.CreateContextLinkageOptions(options.Mode,
                options.SpecifiedContextId);
        }

        public static IContextLinkageOptions Convert(this Maybe<ContextLinkageOptions> options, IProtocolMessageFactory messageFactory)
        {
            if (!options.HasValue)
            {
                return CreateDefaultContextLinkageOptions(messageFactory);
            }

            return options.Value.Convert(messageFactory);
        }

        private static IContextLinkageOptions CreateDefaultContextLinkageOptions(IProtocolMessageFactory messageFactory)
        {
            return messageFactory.CreateContextLinkageOptions(ContextLinkageDiscoveryMode.None, Maybe<string>.Nothing);
        }
    }
}
