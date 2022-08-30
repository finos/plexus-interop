﻿/**
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
namespace Plexus.Interop.Transport.Internal
{
    using Plexus.Interop.Protocol.Common;
    using Plexus.Interop.Transport.Protocol;
    using System;

    internal static class TransportUtils
    {
        public static ErrorHeader GetErrorHeader(Exception ex)
        {
            var message = ex is RemoteErrorException remoteError ? remoteError.RemoteMessage : ex.Message;
            return new ErrorHeader(message, ex.FormatToString(), ex.GetBaseException().GetType().Name);
        }
    }
}