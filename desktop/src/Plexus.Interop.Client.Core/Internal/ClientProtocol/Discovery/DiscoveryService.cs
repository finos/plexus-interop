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
namespace Plexus.Interop.Internal.ClientProtocol.Discovery
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Discovery;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using MethodType = Plexus.Interop.MethodType;

    internal sealed class DiscoveryService : IDiscoveryService
    {
        private readonly ILogger _log;
        private readonly ITransportConnection _transportConnection;
        private readonly IProtocolImplementation _protocol;

        public DiscoveryService(
            UniqueId id,
            ITransportConnection transportConnection,
            IProtocolImplementation protocol)
        {
            _log = LogManager.GetLogger<DiscoveryService>(id.ToString());
            _transportConnection = transportConnection;
            _protocol = protocol;
        }

        public async Task<IReadOnlyCollection<DiscoveredMethod>> DiscoverAsync(MethodDiscoveryQuery query, ContextLinkageDiscoveryOptions contextLinkageDiscoveryOptions = null, bool online = false)
        {
            var channel = await _transportConnection.CreateChannelAsync().ConfigureAwait(false);
            try
            {
                using (var msg = _protocol.MessageFactory
                    .CreateMethodDiscoveryRequest(
                        query.InputMessageId,
                        query.OutputMessageId,
                        Convert(query.MethodReference),
                        online ? DiscoveryMode.Online : DiscoveryMode.Offline, 
                        Convert(contextLinkageDiscoveryOptions)))
                {
                    var serializedRequest = _protocol.Serializer.Serialize(msg);
                    try
                    {
                        await channel.Out.WriteAsync(new TransportMessageFrame(serializedRequest)).ConfigureAwait(false);
                        channel.Out.TryComplete();
                    }
                    catch
                    {
                        serializedRequest.Dispose();
                        throw;
                    }
                    using (var serializedResponse = (await channel.In.ReadAsync().ConfigureAwait(false)).Payload)
                    {
                        var discoveryResponse = _protocol.Serializer.DeserializeMethodDiscoveryResponse(serializedResponse);
                        return Convert(discoveryResponse);
                    }
                }
            }
            catch (Exception ex)
            {
                channel.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                await channel.Completion.ConfigureAwait(false);
            }
        }

        public async Task<IReadOnlyCollection<DiscoveredService>> DiscoverAsync(ServiceDiscoveryQuery query, ContextLinkageDiscoveryOptions contextLinkageDiscoveryOptions = null, bool online = false)
        {
            var channel = await _transportConnection.CreateChannelAsync().ConfigureAwait(false);
            try
            {
                using (var msg = _protocol.MessageFactory
                    .CreateServiceDiscoveryRequest(
                        Convert(query.ConsumedService),
                        online ? DiscoveryMode.Online : DiscoveryMode.Offline, 
                        Convert(contextLinkageDiscoveryOptions)))
                {
                    var serializedRequest = _protocol.Serializer.Serialize(msg);
                    await channel.Out.WriteOrDisposeAsync(new TransportMessageFrame(serializedRequest)).ConfigureAwait(false);
                    channel.Out.TryComplete();
                    using (var serializedResponse = (await channel.In.ReadAsync().ConfigureAwait(false)).Payload)
                    {
                        var discoveryResponse = _protocol.Serializer.DeserializeServiceDiscoveryResponse(serializedResponse);
                        return Convert(discoveryResponse);
                    }
                }
            }
            catch (Exception ex)
            {
                channel.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                await channel.Completion.ConfigureAwait(false);
            }
        }

        private IContextLinkageOptions Convert(ContextLinkageDiscoveryOptions contextLinkageDiscoveryOptions)
        {
            if (contextLinkageDiscoveryOptions == null)
            {
                return _protocol.MessageFactory.CreateContextLinkageOptions(ContextLinkageDiscoveryMode.None, Maybe<string>.Nothing);
            }

            return _protocol.MessageFactory.CreateContextLinkageOptions(contextLinkageDiscoveryOptions.Mode,
                contextLinkageDiscoveryOptions.SpecifiedContextId);
        }

        private IReadOnlyCollection<DiscoveredService> Convert(IServiceDiscoveryResponse discoveryResponse)
        {
            return discoveryResponse.Services.Select(Convert).ToList();
        }

        private DiscoveredService Convert(IDiscoveredService discoveredService)
        {
            var service = Convert(discoveredService.ProvidedService);
            return new DiscoveredService(service, discoveredService.ServiceTitle, discoveredService.Methods.Select(m => Convert(service, m)));
        }

        private DiscoveredMethod Convert(ProvidedServiceReference providedService, IDiscoveredServiceMethod method)
        {
            return new DiscoveredMethod(
                new ProvidedMethodReference(providedService, method.MethodId),
                method.MethodTitle,
                method.InputMessageId,
                method.OutputMessageId,
                Convert(method.MethodType),
                method.Options.Select(x => new Option(x.Id, x.Value)).ToList());
        }

        private ProvidedServiceReference Convert(IProvidedServiceReference providedService)
        {
            return new ProvidedServiceReference(
                providedService.ServiceId, 
                providedService.ServiceAlias, 
                providedService.ApplicationId, 
                providedService.ConnectionId);
        }

        private Maybe<IConsumedServiceReference> Convert(Maybe<ServiceReference> consumedService)
        {
            if (!consumedService.HasValue)
            {
                return Maybe<IConsumedServiceReference>.Nothing;
            }
            var value = consumedService.Value;
            return new Maybe<IConsumedServiceReference>(_protocol.MessageFactory.CreateConsumedServiceReference(value.Id, value.Alias));
        }

        private static IReadOnlyCollection<DiscoveredMethod> Convert(IMethodDiscoveryResponse discoveryResponse)
        {
            return discoveryResponse.Methods.Select(Convert).ToList();
        }

        private static DiscoveredMethod Convert(IDiscoveredMethod method)
        {
            return new DiscoveredMethod(
                new ProvidedMethodReference(
                    new ProvidedServiceReference( 
                        method.ProvidedMethod.ProvidedService.ServiceId,
                        method.ProvidedMethod.ProvidedService.ServiceAlias,                    
                        method.ProvidedMethod.ProvidedService.ApplicationId,
                        method.ProvidedMethod.ProvidedService.ConnectionId),
                    method.ProvidedMethod.MethodId),
                method.MethodTitle,
                method.InputMessageId,
                method.OutputMessageId,
                Convert(method.MethodType),
                method.Options.Select(x => new Option(x.Id, x.Value)).ToList());
        }

        private static MethodType Convert(Protocol.Discovery.MethodType methodType)
        {
            switch (methodType)
            {
                case Protocol.Discovery.MethodType.Unary:
                    return MethodType.Unary;
                case Protocol.Discovery.MethodType.ServerStreaming:
                    return MethodType.ServerStreaming;
                case Protocol.Discovery.MethodType.ClientStreaming:
                    return MethodType.ClientStreaming;
                case Protocol.Discovery.MethodType.DuplexStreaming:
                    return MethodType.DuplexStreaming;
                default:
                    throw new ArgumentOutOfRangeException(nameof(methodType), methodType, null);
            }
        }

        private Maybe<IConsumedMethodReference> Convert(Maybe<MethodReference> method)
        {
            return method.HasValue
                ? new Maybe<IConsumedMethodReference>(Convert(method.Value))
                : Maybe<IConsumedMethodReference>.Nothing;
        }

        private IConsumedMethodReference Convert(MethodReference method)
        {
            return _protocol.MessageFactory.CreateConsumedMethodReference(
                _protocol.MessageFactory.CreateConsumedServiceReference(
                    method.Service.Id,
                    method.Service.Alias),
                method.Name);
        }
    }
}
