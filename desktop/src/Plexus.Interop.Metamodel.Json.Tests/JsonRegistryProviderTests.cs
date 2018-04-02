/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Metamodel.Json
{
    using System.Linq;
    using Shouldly;
    using Xunit;

    public sealed class JsonRegistryProviderTests : TestsSuite
    {
        [Fact]
        public void ParsesRegistryJson()
        {
            using (var provider = JsonRegistryProvider.Initialize("interop.json"))
            {
                var registry = provider.Current;

                registry.ShouldNotBeNull();
                registry.Services.Count.ShouldBe(2);
                registry.Applications.Count.ShouldBe(4);
                registry.Messages.Count.ShouldBe(3);

                var message = registry.Messages["interop.testing.EchoRequest"];
                message.Id.ShouldBe("interop.testing.EchoRequest");

                var service = registry.Services["interop.testing.EchoService"];
                service.Id.ShouldBe("interop.testing.EchoService");
                service.Methods.Count.ShouldBe(4);

                var unaryMethod = service.Methods["Unary"];
                unaryMethod.Service.ShouldBe(service);
                unaryMethod.InputMessage.ShouldBe(message);
                unaryMethod.OutputMessage.ShouldBe(message);
                unaryMethod.Type.ShouldBe(MethodType.Unary);                

                var clientStreamingMethod = service.Methods["ClientStreaming"];
                clientStreamingMethod.Service.ShouldBe(service);
                clientStreamingMethod.InputMessage.ShouldBe(message);
                clientStreamingMethod.OutputMessage.ShouldBe(message);
                clientStreamingMethod.Type.ShouldBe(MethodType.ClientStreaming);

                var consumerApp = registry.Applications["interop.testing.EchoClient"];
                consumerApp.ConsumedServices.Count.ShouldBe(1);
                var consumedService = consumerApp.ConsumedServices.Single();
                consumedService.Service.ShouldBe(service);
                consumedService.Alias.ShouldBe(Maybe<string>.Nothing);
                consumedService.From.ShouldNotBeNull();
                consumedService.From.IsMatch("interop.testing.EchoServer").ShouldBe(true);
                consumedService.From.IsMatch("something.EchoServer").ShouldBe(false);
                consumedService.Methods.Count.ShouldBe(4);
                consumedService.Methods["ClientStreaming"].Method.ShouldBe(clientStreamingMethod);            

                var providerApp = registry.Applications["interop.testing.EchoServer"];
                providerApp.ProvidedServices.Count.ShouldBe(1);
                var providedService = providerApp.ProvidedServices.Single();
                providedService.Service.ShouldBe(service);
                providedService.Alias.ShouldBe(Maybe<string>.Nothing);
                providedService.To.ShouldNotBeNull();
                providedService.To.IsMatch("interop.testing.*").ShouldBe(true);
                providedService.Title.ShouldBe("Sample Echo Service Implementation");
                var providedMethod = providedService.Methods["Unary"];
                providedMethod.Method.ShouldBe(unaryMethod);
                providedMethod.LaunchMode.ShouldBe(LaunchMode.MultiInstance);                
            }
        }
    }
}
