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
    using System;

    public sealed class Method
    {
        public static UnaryMethod<TRequest, TResponse> Unary<TRequest, TResponse>(string serviceId, string methodId)
        {
            return new UnaryMethod<TRequest, TResponse>(MethodReference.Create(serviceId, methodId));
        }

        public static UnaryMethod<TRequest, TResponse> Unary<TRequest, TResponse>(string serviceId, string serviceAlias, string methodId)
        {
            return new UnaryMethod<TRequest, TResponse>(MethodReference.Create(serviceId, serviceAlias, methodId));
        }

        public static ServerStreamingMethod<TRequest, TResponse> ServerStreaming<TRequest, TResponse>(string serviceId, string methodId)
        {
            return new ServerStreamingMethod<TRequest, TResponse>(MethodReference.Create(serviceId, methodId));
        }

        public static ServerStreamingMethod<TRequest, TResponse> ServerStreaming<TRequest, TResponse>(string serviceId, string serviceAlias, string methodId)
        {
            return new ServerStreamingMethod<TRequest, TResponse>(MethodReference.Create(serviceId, serviceAlias, methodId));
        }

        public static ClientStreamingMethod<TRequest, TResponse> ClientStreaming<TRequest, TResponse>(string serviceId, string methodId)
        {
            return new ClientStreamingMethod<TRequest, TResponse>(MethodReference.Create(serviceId, methodId));
        }

        public static ClientStreamingMethod<TRequest, TResponse> ClientStreaming<TRequest, TResponse>(string serviceId, string serviceAlias, string methodId)
        {
            return new ClientStreamingMethod<TRequest, TResponse>(MethodReference.Create(serviceId, serviceAlias, methodId));
        }

        public static DuplexStreamingMethod<TRequest, TResponse> DuplexStreaming<TRequest, TResponse>(string serviceId, string methodId)
        {
            return new DuplexStreamingMethod<TRequest, TResponse>(MethodReference.Create(serviceId, methodId));
        }

        public static DuplexStreamingMethod<TRequest, TResponse> DuplexStreaming<TRequest, TResponse>(string serviceId, string serviceAlias, string methodId)
        {
            return new DuplexStreamingMethod<TRequest, TResponse>(MethodReference.Create(serviceId, serviceAlias, methodId));
        }
    }

    /// <summary>
    /// A non-generic representation of a remote method.
    /// </summary>
    public class Method<TSend, TReceive> : IMethod<TSend, TReceive>
    {
        internal Method(MethodReference methodReference)
        {
            Reference = methodReference ?? throw new ArgumentNullException(nameof(methodReference));
            CallDescriptor = Reference.CallDescriptor;
        }

        public MethodReference Reference { get; }

        public MethodCallDescriptor CallDescriptor { get; }

        public override string ToString()
        {
            return $"Type: {GetType().FormatName()}, {nameof(Reference)}: {Reference}";
        }
    }

    public class UnaryMethod<TRequest> : Method<TRequest, Nothing>, IUnaryMethod<TRequest, Nothing>
    {
        internal UnaryMethod(MethodReference methodReference) : base(methodReference)
        {
        }
    }

    public class UnaryMethod<TRequest, TResponse> : Method<TRequest, TResponse>, IUnaryMethod<TRequest, TResponse>
    {
        internal UnaryMethod(MethodReference methodReference) : base(methodReference)
        {
        }
    }

    public class ServerStreamingMethod<TRequest, TResponse> : Method<TRequest, TResponse>, IServerStreamingMethod<TRequest, TResponse>
    {
        internal ServerStreamingMethod(MethodReference methodReference) : base(methodReference)
        {
        }
    }

    public class ClientStreamingMethod<TRequest, TResponse> : Method<TRequest, TResponse>, IClientStreamingMethod<TRequest, TResponse>
    {
        internal ClientStreamingMethod(MethodReference methodReference) : base(methodReference)
        {
        }
    }

    public class DuplexStreamingMethod<TRequest, TResponse> : Method<TRequest, TResponse>, IDuplexStreamingMethod<TRequest, TResponse>
    {
        internal DuplexStreamingMethod(MethodReference methodReference) : base(methodReference)
        {
        }
    }
}
