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
namespace Plexus.Interop
{
    using System.Collections.Generic;

    public class DiscoveredMethod : IMethod
    {
        internal DiscoveredMethod(
            ProvidedMethodReference providedMethod,
            Maybe<string> title,
            string inputMessageId,
            string outputMessageId,
            MethodType type,
            IReadOnlyCollection<Option> options)
            : this(
                providedMethod,
                title,
                inputMessageId,
                outputMessageId,
                type,
                new MethodCallDescriptor(providedMethod),
                options)
        {
        }

        internal DiscoveredMethod(
            ProvidedMethodReference providedMethod,
            Maybe<string> title,
            string inputMessageId,
            string outputMessageId,
            MethodType type,
            MethodCallDescriptor callDescriptor,
            IReadOnlyCollection<Option> options)
        {
            ProvidedMethod = providedMethod;
            Title = title;
            InputMessageId = inputMessageId;
            OutputMessageId = outputMessageId;
            Type = type;
            CallDescriptor = callDescriptor;
            Options = options;
        }

        internal DiscoveredMethod(DiscoveredMethod method) : this(
            method.ProvidedMethod, 
            method.Title, 
            method.InputMessageId, 
            method.OutputMessageId,             
            method.Type,
            method.CallDescriptor,
            method.Options)
        {
        }

        public ProvidedMethodReference ProvidedMethod { get; }

        public Maybe<string> Title { get; }

        public string InputMessageId { get; }

        public string OutputMessageId { get; }

        public MethodType Type { get; }

        public MethodCallDescriptor CallDescriptor { get; }

        public IReadOnlyCollection<Option> Options { get; }

        public override string ToString()
        {
            return $"Type: {GetType().FormatName()}, {nameof(ProvidedMethod)}: {{{ProvidedMethod}}}, {nameof(Title)}: {Title}, {nameof(InputMessageId)}: {InputMessageId}, {nameof(OutputMessageId)}: {OutputMessageId}, {nameof(Options)}: {Options.FormatEnumerableObjects()}";
        }
    }

    public class DiscoveredOnlineMethod : DiscoveredMethod
    {
        internal DiscoveredOnlineMethod(
            ProvidedMethodReference providedMethod,
            Maybe<string> title,
            string inputMessageId,
            string outputMessageId,
            MethodType type,
            IReadOnlyCollection<Option> options)
            : base(
                providedMethod,
                title,
                inputMessageId,
                outputMessageId,
                type,
                options)
        {
            ProviderConnectionId = providedMethod.ProvidedService.ConnectionId.Value;
        }

        internal DiscoveredOnlineMethod(DiscoveredMethod method) : this(
            method.ProvidedMethod,
            method.Title,
            method.InputMessageId,
            method.OutputMessageId,
            method.Type,
            method.Options)
        {
        }

        public UniqueId ProviderConnectionId { get; }

        public override string ToString()
        {
            return $"{base.ToString()}, {nameof(ProviderConnectionId)}: {ProviderConnectionId}";
        }
    }

    public class DiscoveredMethod<TRequest, TResponse> : DiscoveredMethod, IMethod<TRequest, TResponse>
    {
        internal DiscoveredMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public class DiscoveredOnlineMethod<TRequest, TResponse> : DiscoveredOnlineMethod, IMethod<TRequest, TResponse>
    {
        internal DiscoveredOnlineMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredUnaryMethod<TRequest, TResponse> : DiscoveredMethod<TRequest, TResponse>, IUnaryMethod<TRequest, TResponse>
    {
        internal DiscoveredUnaryMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredServerStreamingMethod<TRequest, TResponse> : DiscoveredMethod<TRequest, TResponse>, IServerStreamingMethod<TRequest, TResponse>
    {
        internal DiscoveredServerStreamingMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredClientStreamingMethod<TRequest, TResponse> : DiscoveredMethod<TRequest, TResponse>, IClientStreamingMethod<TRequest, TResponse>
    {
        internal DiscoveredClientStreamingMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredDuplexStreamingMethod<TRequest, TResponse> : DiscoveredMethod<TRequest, TResponse>, IDuplexStreamingMethod<TRequest, TResponse>
    {
        internal DiscoveredDuplexStreamingMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredOnlineUnaryMethod<TRequest, TResponse> : DiscoveredOnlineMethod<TRequest, TResponse>, IUnaryMethod<TRequest, TResponse>
    {
        internal DiscoveredOnlineUnaryMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredOnlineServerStreamingMethod<TRequest, TResponse> : DiscoveredOnlineMethod<TRequest, TResponse>, IServerStreamingMethod<TRequest, TResponse>
    {
        internal DiscoveredOnlineServerStreamingMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredOnlineClientStreamingMethod<TRequest, TResponse> : DiscoveredOnlineMethod<TRequest, TResponse>, IClientStreamingMethod<TRequest, TResponse>
    {
        internal DiscoveredOnlineClientStreamingMethod(DiscoveredMethod method) : base(method)
        {
        }
    }

    public sealed class DiscoveredOnlineDuplexStreamingMethod<TRequest, TResponse> : DiscoveredOnlineMethod<TRequest, TResponse>
    {
        internal DiscoveredOnlineDuplexStreamingMethod(DiscoveredMethod method) : base(method)
        {
        }
    }
}
