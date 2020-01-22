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
﻿/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
    using Plexus.Pools;

    internal class ContextLinkageOptions : PooledObject<ContextLinkageOptions>, IContextLinkageOptions
    {
        public ContextLinkageDiscoveryMode Mode { get; set; }

        public Maybe<string> SpecificContext { get; set; }

        protected override void Cleanup()
        {
            SpecificContext = Maybe<string>.Nothing;
            Mode = ContextLinkageDiscoveryMode.None;
        }

        public override string ToString()
        {
            return $"{nameof(Mode)}: {Mode}, {nameof(SpecificContext)}: {SpecificContext}";
        }
    }
}
