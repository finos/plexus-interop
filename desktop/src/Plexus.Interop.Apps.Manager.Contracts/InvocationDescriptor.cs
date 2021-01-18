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
    public sealed class InvocationDescriptor
    {
        public InvocationDescriptor(
            AppConnectionDescriptor sourceConnection, 
            AppConnectionDescriptor targetConnection, 
            string serviceId, 
            string serviceAlias, 
            string methodId)
        {
            SourceConnection = sourceConnection;
            TargetConnection = targetConnection;
            ServiceId = serviceId;
            ServiceAlias = serviceAlias;
            MethodId = methodId;
        }

        public AppConnectionDescriptor SourceConnection { get; }
        public AppConnectionDescriptor TargetConnection { get; }
        public string ServiceId { get; }
        public string ServiceAlias { get; }
        public string MethodId { get; }

        public override string ToString()
        {
            return $"{nameof(SourceConnection)}: {SourceConnection}, {nameof(TargetConnection)}: {TargetConnection}, {nameof(ServiceId)}: {ServiceId}, {nameof(ServiceAlias)}: {ServiceAlias}, {nameof(MethodId)}: {MethodId}";
        }
    }
}
