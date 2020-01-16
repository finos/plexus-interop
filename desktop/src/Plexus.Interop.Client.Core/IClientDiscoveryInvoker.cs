/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
    using System.Threading.Tasks;

    public interface IClientDiscoveryInvoker
    {
        Task<IReadOnlyCollection<DiscoveredMethod>> DiscoverAsync(MethodDiscoveryQuery query);

        Task<IReadOnlyCollection<DiscoveredMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query);

        Task<IReadOnlyCollection<DiscoveredMethod<TRequest, Nothing>>> DiscoverAsync<TRequest>(MethodDiscoveryQuery<TRequest, Nothing> query);

        Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query);

        Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, Nothing>>> DiscoverOnlineAsync<TRequest>(MethodDiscoveryQuery<TRequest, Nothing> query);

        Task<IReadOnlyCollection<DiscoveredService>> DiscoverAsync(ServiceDiscoveryQuery query);

        Task<IReadOnlyCollection<DiscoveredOnlineService>> DiscoverOnlineAsync(ServiceDiscoveryQuery query);

        Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, TResponse>>> DiscoverInCurrentContextAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query);

        Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, TResponse>>> DiscoverInSpecificContextAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query, string contextId);

        Task<IReadOnlyCollection<DiscoveredOnlineService>> DiscoverInCurrentContextAsync(ServiceDiscoveryQuery query);

        Task<IReadOnlyCollection<DiscoveredOnlineService>> DiscoverInSpecificContextAsync(ServiceDiscoveryQuery query, string contextId);
    }
}
