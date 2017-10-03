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
﻿namespace Plexus.Interop
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public static class ClientDiscoveryInvokerExtensions
    {
        public static Task<IReadOnlyCollection<DiscoveredMethod<TRequest, Nothing>>> DiscoverAsync<TRequest>(
            this IClientDiscoveryInvoker invoker)
        {
            return invoker.DiscoverAsync(MethodDiscoveryQuery.Create<TRequest, Nothing>());
        }

        public static Task<IReadOnlyCollection<DiscoveredMethod<TRequest, Nothing>>> DiscoverOnlineAsync<TRequest>(
            this IClientDiscoveryInvoker invoker)
        {
            return invoker.DiscoverAsync(MethodDiscoveryQuery.Create<TRequest, Nothing>());
        }

        public static Task<IReadOnlyCollection<DiscoveredMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker)
        {
            return invoker.DiscoverAsync(MethodDiscoveryQuery.Create<TRequest, TResponse>());
        }

        public static Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker)
        {
            return invoker.DiscoverOnlineAsync(MethodDiscoveryQuery.Create<TRequest, TResponse>());
        }

        public static async Task<IReadOnlyCollection<DiscoveredUnaryMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, UnaryMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredUnaryMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredUnaryMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, UnaryMethod<TRequest, TResponse> method)
        {
            return DiscoverAsync(invoker, MethodDiscoveryQuery.Create(method));
        }

        public static async Task<IReadOnlyCollection<DiscoveredOnlineUnaryMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, UnaryMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverOnlineAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredOnlineUnaryMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredOnlineUnaryMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, UnaryMethod<TRequest, TResponse> method)
        {
            return DiscoverOnlineAsync(invoker, MethodDiscoveryQuery.Create(method));
        }

        public static async Task<IReadOnlyCollection<DiscoveredServerStreamingMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ServerStreamingMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredServerStreamingMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredServerStreamingMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ServerStreamingMethod<TRequest, TResponse> method)
        {
            return DiscoverAsync(invoker, MethodDiscoveryQuery.Create(method));
        }

        public static async Task<IReadOnlyCollection<DiscoveredOnlineServerStreamingMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ServerStreamingMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverOnlineAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredOnlineServerStreamingMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredOnlineServerStreamingMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ServerStreamingMethod<TRequest, TResponse> method)
        {
            return DiscoverOnlineAsync(invoker, MethodDiscoveryQuery.Create(method));
        }

        public static async Task<IReadOnlyCollection<DiscoveredClientStreamingMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ClientStreamingMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredClientStreamingMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredClientStreamingMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ClientStreamingMethod<TRequest, TResponse> method)
        {
            return DiscoverAsync(invoker, MethodDiscoveryQuery.Create(method));
        }

        public static async Task<IReadOnlyCollection<DiscoveredOnlineClientStreamingMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ClientStreamingMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverOnlineAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredOnlineClientStreamingMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredOnlineClientStreamingMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, ClientStreamingMethod<TRequest, TResponse> method)
        {
            return DiscoverOnlineAsync(invoker, MethodDiscoveryQuery.Create(method));
        }

        public static async Task<IReadOnlyCollection<DiscoveredDuplexStreamingMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, DuplexStreamingMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredDuplexStreamingMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredDuplexStreamingMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, DuplexStreamingMethod<TRequest, TResponse> method)
        {
            return DiscoverAsync(invoker, MethodDiscoveryQuery.Create(method));
        }

        public static async Task<IReadOnlyCollection<DiscoveredOnlineDuplexStreamingMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, DuplexStreamingMethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResult = await invoker
                .DiscoverOnlineAsync(query)
                .ConfigureAwait(false);
            return discoveryResult.Select(x => new DiscoveredOnlineDuplexStreamingMethod<TRequest, TResponse>(x)).ToList();
        }

        public static Task<IReadOnlyCollection<DiscoveredOnlineDuplexStreamingMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(
            this IClientDiscoveryInvoker invoker, DuplexStreamingMethod<TRequest, TResponse> method)
        {
            return DiscoverOnlineAsync(invoker, MethodDiscoveryQuery.Create(method));
        }
    }
}
