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
namespace Plexus.Interop.Transport.Protocol
{
    using Plexus.Interop.Protocol.Common;

    public sealed class RemoteErrorException : ProtocolException
    {
        public string RemoteMessage { get; }
        public string Details { get; }
        public string RemoteExceptionName { get; }

        public RemoteErrorException(ErrorHeader errorHeader)
            : this(errorHeader.Message, errorHeader.Details, errorHeader.ExceptionName)
        {
        }

        public RemoteErrorException(string remoteMessage, string details, string remoteExceptionName)
            : base("Error message received: " + remoteMessage, new RemoteException(details))
        {
            RemoteMessage = remoteMessage;
            Details = details;
            RemoteExceptionName = remoteExceptionName;
        }
    }
}
