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
﻿namespace Plexus.Interop.Apps.Internal
{
    using UniqueId = Plexus.UniqueId;

    internal static class ProtobufHelper
    {
        public static UniqueId ToUniqueId(this Generated.UniqueId uniqueId)
        {
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
    }
}
