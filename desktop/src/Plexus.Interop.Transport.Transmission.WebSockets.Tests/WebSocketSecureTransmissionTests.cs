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
namespace Plexus.Interop.Transport.Transmission.WebSockets
{
    using Plexus.Interop.Transport.Transmission.WebSockets.Client;
    using Plexus.Interop.Transport.Transmission.WebSockets.Server;
    using System.Security.Cryptography.X509Certificates;
    using Xunit.Abstractions;

    public sealed class WebSocketSecureTransmissionTests : TransmissionTestsSuite
    {
        public WebSocketSecureTransmissionTests(ITestOutputHelper output) : base(output)
        {
        }

        protected override ITransmissionServer CreateServer()
        {
            var cert = new X509Certificate2("mycert.pfx", "god");
            return WebSocketTransmissionServerFactory.Instance.CreateSecure(new WebSocketTransmissionServerOptions(BrokerWorkingDir), cert);
        }

        protected override ITransmissionClient CreateClient()
        {
            return new WebSocketTransmissionClient();
        }
    }
}
