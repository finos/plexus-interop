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
﻿namespace Plexus.Interop.Apps
{
    using System.Collections.Generic;

    public sealed class AppConnectionDescriptor
    {
        public AppConnectionDescriptor(UniqueId connectionId, string applicationId, UniqueId applicationInstanceId)
        {
            ConnectionId = connectionId;
            ApplicationId = applicationId;
            ApplicationInstanceId = applicationInstanceId;
        }

        public UniqueId ConnectionId { get; }

        public string ApplicationId { get; }

        public UniqueId ApplicationInstanceId { get; }

        public override bool Equals(object obj)
        {
            return obj is AppConnectionDescriptor info &&
                   ConnectionId.Equals(info.ConnectionId) &&
                   ApplicationId == info.ApplicationId &&
                   ApplicationInstanceId.Equals(info.ApplicationInstanceId);
        }

        public override int GetHashCode()
        {
            var hashCode = 1884911355;
            hashCode = hashCode * -1521134295 + EqualityComparer<UniqueId>.Default.GetHashCode(ConnectionId);
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(ApplicationId);
            hashCode = hashCode * -1521134295 + EqualityComparer<UniqueId>.Default.GetHashCode(ApplicationInstanceId);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{ApplicationId}, {nameof(ConnectionId)}: {ConnectionId}, {nameof(ApplicationInstanceId)}: {ApplicationInstanceId}";
        }
    }
}
