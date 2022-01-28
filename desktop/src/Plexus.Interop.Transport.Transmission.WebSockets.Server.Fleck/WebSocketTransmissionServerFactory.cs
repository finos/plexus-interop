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
﻿namespace Plexus.Interop.Transport.Transmission.WebSockets.Server
{
    using Plexus.Interop.Transport.Transmission.WebSockets.Server.Internal;
    using System.Security.Authentication;
    using System.Security.Cryptography.X509Certificates;

    public sealed class WebSocketTransmissionServerFactory
    {
        public static WebSocketTransmissionServerFactory Instance = new WebSocketTransmissionServerFactory();

        public ITransmissionServer Create(WebSocketTransmissionServerOptions options)
        {
            return new WebSocketTransmissionServer(options);
        }

        public ITransmissionServer CreateSecure(WebSocketTransmissionServerOptions options, X509Certificate2 certificate, SslProtocols sslProtocols)
        {
            return new WebSocketTransmissionServer(options, certificate, sslProtocols);
        }
    }
}
