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
 namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using System;
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;
    using System.Threading.Tasks;
    using JetBrains.Annotations;

    internal sealed class OutcomingInvocationFactory : IOutcomingInvocationFactory
    {
        private readonly ITransportConnection _connection;
        private readonly IProtocolImplementation _protocol;
        private readonly IMarshallerProvider _marshaller;

        public OutcomingInvocationFactory(
            [NotNull] ITransportConnection connection, 
            [NotNull] IProtocolImplementation protocol,
            [NotNull] IMarshallerProvider marshaller)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
            _protocol = protocol ?? throw new ArgumentNullException(nameof(protocol));
            _marshaller = marshaller ?? throw new ArgumentNullException(nameof(marshaller));
        }

        public async ValueTask<IOutcomingInvocation<TRequest, TResponse>> CreateAsync<TRequest, TResponse>(
            MethodCallDescriptor methodCall, Maybe<TRequest> request = default)
        {
            var channel = await _connection.CreateChannelAsync().ConfigureAwait(false);
            InvocationMethodDescriptor methodDescriptor = null;
            InvocationTargetDescriptor targetDescriptor = null;
            if (methodCall.Method.HasValue)
            {
                var method = methodCall.Method.Value;
                methodDescriptor = new InvocationMethodDescriptor(method.Service.Id, method.Name, method.Service.Alias);
            }
            if (methodCall.ProvidedMethod.HasValue)
            {
                var method = methodCall.ProvidedMethod.Value;
                methodDescriptor = new InvocationMethodDescriptor(method.ProvidedService.ServiceId, method.Name, method.ProvidedService.ServiceId);
                targetDescriptor = new InvocationTargetDescriptor(method.ProvidedService.ApplicationId, method.ProvidedService.ConnectionId, method.ProvidedService.ServiceAlias);
            }
            var descriptor = new OutcomingInvocationDescriptor(methodDescriptor, targetDescriptor);
            var invocation = new OutcomingInvocation<TRequest, TResponse>(
                descriptor,
                channel,
                _protocol,
                GetMarshaller<TRequest>(),
                GetMarshaller<TResponse>());
            invocation.Start();
            if (request.HasValue)
            {
                await invocation.Out.WriteAsync(request.Value).ConfigureAwait(false);
                invocation.Out.TryComplete();
            }
            return invocation;
        }

        private IMarshaller<T> GetMarshaller<T>()
        {
            return typeof(T) == typeof(Nothing)
                ? (IMarshaller<T>) NothingMarshaller.Instance
                : _marshaller.GetMarshaller<T>();
        }
    }
}
