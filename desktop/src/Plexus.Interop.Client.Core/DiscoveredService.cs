/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop
{
    using System.Collections.Generic;
    using System.Linq;

    public sealed class DiscoveredService
    {
        internal DiscoveredService(
            ProvidedServiceReference providedService,
            Maybe<string> title, 
            IEnumerable<DiscoveredMethod> methods)
        {
            ProvidedService = providedService;
            Title = title;
            Methods = new List<DiscoveredMethod>(methods);
        }

        public ProvidedServiceReference ProvidedService { get; }

        public Maybe<string> Title { get; set; }

        public IReadOnlyCollection<DiscoveredMethod> Methods { get; }

        public override string ToString()
        {
            return $"{nameof(ProvidedService)}: {{{ProvidedService}}}, {nameof(Title)}: {Title}, {nameof(Methods)}: {Methods.FormatEnumerableObjects()}";
        }
    }

    public sealed class DiscoveredOnlineService
    {
        internal DiscoveredOnlineService(
            ProvidedServiceReference providedService,
            Maybe<string> title, 
            IEnumerable<DiscoveredOnlineMethod> methods)
        {
            ProvidedService = providedService;
            Title = title;
            Methods = new List<DiscoveredOnlineMethod>(methods);
            ProviderConnectionId = providedService.ConnectionId.Value;
        }

        internal DiscoveredOnlineService(DiscoveredService service)
            : this(
                service.ProvidedService,
                service.Title,
                service.Methods.Select(x => new DiscoveredOnlineMethod(x)))
        {
        }

        public ProvidedServiceReference ProvidedService { get; }

        public Maybe<string> Title { get; set; }

        public IReadOnlyCollection<DiscoveredOnlineMethod> Methods { get; }

        public UniqueId ProviderConnectionId { get; }

        public override string ToString()
        {
            return $"{nameof(ProvidedService)}: {{{ProvidedService}}}, {nameof(Title)}: {Title}, {nameof(ProviderConnectionId)}: {ProviderConnectionId}, {nameof(Methods)}: {Methods.FormatEnumerableObjects()},";
        }
    }
}
