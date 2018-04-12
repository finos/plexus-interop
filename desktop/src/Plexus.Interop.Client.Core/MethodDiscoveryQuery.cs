/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
    public sealed class MethodDiscoveryQuery
    {
        public static MethodDiscoveryQuery<TRequest, TResponse> Create<TRequest, TResponse>(Method<TRequest, TResponse> method) =>
            new MethodDiscoveryQuery<TRequest, TResponse>(method.Reference);

        public static UnaryMethodDiscoveryQuery<TRequest, TResponse> Create<TRequest, TResponse>(UnaryMethod<TRequest, TResponse> method)
            => new UnaryMethodDiscoveryQuery<TRequest, TResponse>(method.Reference);

        public static ServerStreamingMethodDiscoveryQuery<TRequest, TResponse> Create<TRequest, TResponse>(ServerStreamingMethod<TRequest, TResponse> method)
            => new ServerStreamingMethodDiscoveryQuery<TRequest, TResponse>(method.Reference);

        public static ClientStreamingMethodDiscoveryQuery<TRequest, TResponse> Create<TRequest, TResponse>(ClientStreamingMethod<TRequest, TResponse> method)
            => new ClientStreamingMethodDiscoveryQuery<TRequest, TResponse>(method.Reference);

        public static DuplexStreamingMethodDiscoveryQuery<TRequest, TResponse> Create<TRequest, TResponse>(
            DuplexStreamingMethod<TRequest, TResponse> method)
            => new DuplexStreamingMethodDiscoveryQuery<TRequest, TResponse>(method.Reference);

        public static MethodDiscoveryQuery<TRequest, TResponse> Create<TRequest, TResponse>() =>
            new MethodDiscoveryQuery<TRequest, TResponse>();

        public static MethodDiscoveryQuery<TRequest, Nothing> Create<TRequest>() =>
            new MethodDiscoveryQuery<TRequest, Nothing>();

        public static MethodDiscoveryQuery Create() 
            => new MethodDiscoveryQuery(default, default, default);

        public static MethodDiscoveryQuery Create(MethodReference method) 
            => new MethodDiscoveryQuery(method, default, default);

        public static MethodDiscoveryQuery Create(string inputMessageId) 
            => new MethodDiscoveryQuery(default, inputMessageId, default);

        public static MethodDiscoveryQuery Create(string inputMessageId, string outputMessageId) 
            => new MethodDiscoveryQuery(default, inputMessageId, outputMessageId);

        public Maybe<MethodReference> MethodReference { get; }

        public Maybe<string> InputMessageId { get; }

        public Maybe<string> OutputMessageId { get; }

        internal MethodDiscoveryQuery(
            Maybe<MethodReference> methodReference, 
            Maybe<string> inputMessageId, 
            Maybe<string> outputMessageId)
        {
            MethodReference = methodReference;
            InputMessageId = inputMessageId;
            OutputMessageId = outputMessageId;
        }

        public override string ToString()
        {
            return $"{nameof(MethodReference)}: {MethodReference}, {nameof(InputMessageId)}: {InputMessageId}, {nameof(OutputMessageId)}: {OutputMessageId}";
        }
    }

    public class MethodDiscoveryQuery<TRequest, TResponse>
    {
        internal MethodDiscoveryQuery()
        {
        }

        internal MethodDiscoveryQuery(MethodDiscoveryQuery<TRequest, TResponse> query) : this(query.MethodReference)
        {

        }

        internal MethodDiscoveryQuery(MethodReference methodReference) : this(new Maybe<MethodReference>(methodReference))
        {
        }

        internal MethodDiscoveryQuery(Maybe<MethodReference> methodReference)
        {
            MethodReference = methodReference;
        }

        public Maybe<MethodReference> MethodReference { get; }

        public override string ToString()
        {
            return $"Type: {GetType().FormatName()}, {nameof(MethodReference)}: {MethodReference}";
        }
    }

    public sealed class UnaryMethodDiscoveryQuery<TRequest, TResponse> : MethodDiscoveryQuery<TRequest, TResponse>
    {
        internal UnaryMethodDiscoveryQuery(MethodDiscoveryQuery<TRequest, TResponse> query) : base(query)
        {
        }

        internal UnaryMethodDiscoveryQuery(MethodReference methodReference) : base(methodReference)
        {
        }
    }

    public sealed class ServerStreamingMethodDiscoveryQuery<TRequest, TResponse> : MethodDiscoveryQuery<TRequest, TResponse>
    {
        internal ServerStreamingMethodDiscoveryQuery(MethodDiscoveryQuery<TRequest, TResponse> query) : base(query)
        {
        }

        internal ServerStreamingMethodDiscoveryQuery(MethodReference methodReference) : base(methodReference)
        {
        }
    }

    public sealed class ClientStreamingMethodDiscoveryQuery<TRequest, TResponse> : MethodDiscoveryQuery<TRequest, TResponse>
    {
        internal ClientStreamingMethodDiscoveryQuery(MethodDiscoveryQuery<TRequest, TResponse> query) : base(query)
        {
        }

        internal ClientStreamingMethodDiscoveryQuery(MethodReference methodReference) : base(methodReference)
        {
        }
    }

    public sealed class DuplexStreamingMethodDiscoveryQuery<TRequest, TResponse> : MethodDiscoveryQuery<TRequest, TResponse>
    {
        internal DuplexStreamingMethodDiscoveryQuery(MethodDiscoveryQuery<TRequest, TResponse> query) : base(query)
        {
        }

        internal DuplexStreamingMethodDiscoveryQuery(MethodReference methodReference) : base(methodReference)
        {
        }
    }
}
