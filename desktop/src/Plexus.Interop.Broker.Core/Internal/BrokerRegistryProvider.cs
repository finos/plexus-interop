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
﻿namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Metamodel.Json;
    using System;
    using System.Reflection;

    internal sealed class BrokerRegistryProvider : IRegistryProvider, IDisposable
    {
        private readonly IRegistryProvider _baseRegistryProvider;
        private readonly IRegistry _embeddedRegistry;

        public BrokerRegistryProvider(IRegistryProvider baseRegistryProvider)
        {
            _baseRegistryProvider = baseRegistryProvider;
            var type = typeof(BrokerRegistryProvider);
            _embeddedRegistry = JsonRegistry.LoadRegistry(type.GetTypeInfo().Assembly.GetManifestResourceStream(type.Namespace + ".interop.json"));
            Current = _embeddedRegistry.MergeWith(baseRegistryProvider.Current);
            _baseRegistryProvider.Updated += OnUpdated;
        }

        public IRegistry Current { get; private set; }

        public event Action<IRegistry> Updated = registry => { };

        private void OnUpdated(IRegistry registry)
        {
            Current = _embeddedRegistry.MergeWith(registry);
            Updated(Current);
        }

        public void Dispose()
        {
            _baseRegistryProvider.Updated -= OnUpdated;
        }
    }
}
