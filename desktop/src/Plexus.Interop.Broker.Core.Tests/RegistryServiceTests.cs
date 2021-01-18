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
﻿namespace Plexus.Interop.Broker.Core
{
    using System.Linq;
    using Plexus.Interop.Broker.Internal;
    using Plexus.Interop.Metamodel.Json;
    using Shouldly;
    using Xunit;

    public sealed class RegistryServiceTests : TestsSuite
    {
        private readonly RegistryService _sut;

        public RegistryServiceTests()
        {
            _sut = new RegistryService(new JsonRegistryProvider("RegistryServiceTests.interop.json"));
        }

        [Fact]
        public void CanResolveEmbeddedMethods()
        {
            var methods = _sut.GetMatchingProvidedMethods("plexus.tests.App1");
            methods.Count.ShouldBe(1);
            var method = methods.First();
            method.ProvidedService.Application.Id.ShouldBe("interop.AppLifecycleManager");
            method.ProvidedService.Service.Id.ShouldBe("interop.AppLifecycleService");
            method.Method.Name.ShouldBe("GetLifecycleEventStream");
        }
    }
}
