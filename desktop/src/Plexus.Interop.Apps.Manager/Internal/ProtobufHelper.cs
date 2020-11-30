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
﻿namespace Plexus.Interop.Apps.Internal
{
    using System;
    using UniqueId = Plexus.UniqueId;

    internal static class ProtobufHelper
    {
        public static UniqueId ToUniqueId(this Generated.UniqueId uniqueId)
        {
            if (uniqueId is null)
            {
                return UniqueId.Empty;
            }
            return UniqueId.FromHiLo(uniqueId.Hi, uniqueId.Lo);
        }

        public static Generated.UniqueId ToProto(this UniqueId id)
        {
            return new Generated.UniqueId
            {
                Hi = id.Hi,
                Lo = id.Lo
            };
        }

        public static Generated.AppConnectionDescriptor ToProto(this AppConnectionDescriptor info)
        {
            return new Generated.AppConnectionDescriptor
            {
                AppId = info.ApplicationId,
                AppInstanceId = info.ApplicationInstanceId.ToProto(),
                ConnectionId = info.ConnectionId.ToProto()
            };
        }

        public static Generated.InvocationDescriptor ToProto(this InvocationDescriptor info)
        {
            return new Generated.InvocationDescriptor
            {
                Source = info.SourceConnection.ToProto(),
                Target = info.TargetConnection.ToProto(),
                MethodId = info.MethodId,
                ServiceId = info.ServiceId,
                ServiceAliasId = info.ServiceAlias ?? string.Empty
            };
        }

        public static Generated.InvocationResult ToProto(this InvocationResult info)
        {
            switch (info)
            {
                case InvocationResult.Succeeded:
                    return Generated.InvocationResult.Succeeded;
                case InvocationResult.Canceled:
                    return Generated.InvocationResult.Canceled;
                case InvocationResult.Failed:
                    return Generated.InvocationResult.Failed;
                default:
                    throw new ArgumentOutOfRangeException(nameof(info), info, null);
            }
        }
    }
}
