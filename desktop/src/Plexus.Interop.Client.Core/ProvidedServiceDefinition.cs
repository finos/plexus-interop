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
    using Plexus.Interop.Internal;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using System.Collections.Generic;

    /// <summary>
    /// Mapping of method names to call handlers.
    /// </summary>
    public sealed class ProvidedServiceDefinition
    {
        internal ProvidedServiceDefinition(string id, Maybe<string> alias, IReadOnlyDictionary<string, IMethodCallHandler> callHandlers)
        {
            Id = id;
            Alias = alias;
            CallHandlers = callHandlers;
        }

        public string Id { get; }

        public Maybe<string> Alias { get; }

        internal IReadOnlyDictionary<string, IMethodCallHandler> CallHandlers { get; }

        public override string ToString()
        {
            return $"{nameof(Id)}: {Id}, {nameof(Alias)}: {Alias}";
        }

        /// <summary>
        /// Builder class for <see cref="ProvidedServiceDefinition"/>.
        /// </summary>
        public sealed class Builder
        {            
            private readonly Dictionary<string, IMethodCallHandler> _callHandlers = new Dictionary<string, IMethodCallHandler>();
            private readonly IIncomingInvocationFactory _invocationFactory;

            internal Builder(string name, Maybe<string> alias, IIncomingInvocationFactory invocationFactory)
            {
                _invocationFactory = invocationFactory;
                Name = name;
                Alias = alias;
            }

            public string Name { get; }

            public Maybe<string> Alias { get; }

            /// <summary>
            /// Adds a definitions for a single request - single response method.
            /// </summary>
            /// <typeparam name="TRequest">The request message class.</typeparam>
            /// <typeparam name="TResponse">The response message class.</typeparam>
            /// <param name="name">The method name.</param>
            /// <param name="handler">The method handler.</param>
            /// <returns>This builder instance.</returns>
            public Builder WithUnaryMethod<TRequest, TResponse>(string name, UnaryMethodHandler<TRequest, TResponse> handler)
            {
                _callHandlers.Add(name, MethodCallHandlers.Unary(handler, _invocationFactory));
                return this;
            }

            /// <summary>
            /// Adds a definitions for a client streaming method.
            /// </summary>
            /// <typeparam name="TRequest">The request message class.</typeparam>
            /// <typeparam name="TResponse">The response message class.</typeparam>
            /// <param name="name">The method name.</param>
            /// <param name="handler">The method handler.</param>
            /// <returns>This builder instance.</returns>
            public Builder WithClientStreamingMethod<TRequest, TResponse>(string name, ClientStreamingMethodHandler<TRequest, TResponse> handler)
            {
                _callHandlers.Add(name, MethodCallHandlers.ClientStreaming(handler, _invocationFactory));
                return this;
            }

            /// <summary>
            /// Adds a definitions for a server streaming method.
            /// </summary>
            /// <typeparam name="TRequest">The request message class.</typeparam>
            /// <typeparam name="TResponse">The response message class.</typeparam>
            /// <param name="name">The method name.</param>
            /// <param name="handler">The method handler.</param>
            /// <returns>This builder instance.</returns>
            public Builder WithServerStreamingMethod<TRequest, TResponse>(string name, ServerStreamingMethodHandler<TRequest, TResponse> handler)
            {
                _callHandlers.Add(name, MethodCallHandlers.ServerStreaming(handler, _invocationFactory));
                return this;
            }

            /// <summary>
            /// Adds a definitions for a bidirectional streaming method.
            /// </summary>
            /// <typeparam name="TRequest">The request message class.</typeparam>
            /// <typeparam name="TResponse">The response message class.</typeparam>
            /// <param name="name">The method name.</param>
            /// <param name="handler">The method handler.</param>
            /// <returns>This builder instance.</returns>
            public Builder WithDuplexStreamingMethod<TRequest, TResponse>(string name, DuplexStreamingMethodHandler<TRequest, TResponse> handler)
            {
                _callHandlers.Add(name, MethodCallHandlers.DuplexStreaming(handler, _invocationFactory));
                return this;
            }

            internal ProvidedServiceDefinition Build()
            {
                return new ProvidedServiceDefinition(Name, Alias, _callHandlers);
            }
        }
    }
}
