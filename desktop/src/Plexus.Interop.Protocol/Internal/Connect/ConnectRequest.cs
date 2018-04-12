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
﻿using Plexus.Pools;
using Plexus.Interop.Protocol.Connect;
using System.Collections.Generic;

namespace Plexus.Interop.Protocol.Internal.Connect
{
    internal sealed class ConnectRequest : PooledObject<ConnectRequest>, IConnectRequest
    {
        public string ApplicationId { get; set; }

        public UniqueId ApplicationInstanceId { get; set; }

        public override bool Equals(object obj)
        {
            var request = obj as ConnectRequest;
            return request != null &&
                   ApplicationId == request.ApplicationId &&
                   ApplicationInstanceId.Equals(request.ApplicationInstanceId);
        }

        public override int GetHashCode()
        {
            var hashCode = -1840500065;
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(ApplicationId);
            hashCode = hashCode * -1521134295 + EqualityComparer<UniqueId>.Default.GetHashCode(ApplicationInstanceId);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{{{nameof(ApplicationId)}: {ApplicationId}, {nameof(ApplicationInstanceId)}: {ApplicationInstanceId}}}";
        }

        protected override void Cleanup()
        {
            ApplicationId = default;
            ApplicationInstanceId = default;
        }
    }
}
