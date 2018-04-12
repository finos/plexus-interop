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
 namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Discovery;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps;
    using MethodType = Plexus.Interop.Protocol.Discovery.MethodType;

    internal sealed class DiscoveryRequestHandler : IDiscoveryRequestHandler
    {
        private static readonly ILogger Log = LogManager.GetLogger<DiscoveryRequestHandler>();

        private readonly IProtocolImplementation _protocol;
        private readonly IRegistryService _registryService;
        private readonly IAppLifecycleManager _connectionTracker;

        public DiscoveryRequestHandler(
            IAppLifecycleManager connectionTracker,
            IProtocolImplementation protocol,
            IRegistryService registryService)
        {
            _connectionTracker = connectionTracker;
            _protocol = protocol;
            _registryService = registryService;
        }

        public async Task HandleAsync(
            IServiceDiscoveryRequest request, 
            IAppConnection sourceConnection, 
            ITransportChannel sourceChannel)
        {
            IReadOnlyCollection<(IConsumedMethod Consumed, IProvidedMethod Provided)> methodMatches;
            if (request.ConsumedService.HasValue)
            {
                methodMatches = _registryService.GetMethodMatches(
                    sourceConnection.Info.ApplicationId,
                    request.ConsumedService.Value);
            }
            else
            {
                methodMatches = _registryService.GetMethodMatches(sourceConnection.Info.ApplicationId);
            }
            IEnumerable<IGrouping<(IConsumedService ConsumedService, IProvidedService ProvidedService, Maybe<UniqueId> ConnectionId), IProvidedMethod>> groupedMethods;
            if (request.DiscoveryMode == DiscoveryMode.Offline)
            {
                groupedMethods = methodMatches
                    .GroupBy(
                        x => (
                            x.Consumed.ConsumedService,
                            x.Provided.ProvidedService,
                            ConnectionId: Maybe<UniqueId>.Nothing),
                        x => x.Provided);
            }
            else
            {
                var onlineConnections = _connectionTracker.GetOnlineConnections();
                groupedMethods = methodMatches
                    .Join(onlineConnections, x=> x.Provided.ProvidedService.Application.Id, y=>y.Info.ApplicationId, (x, y) => (Match: x, ConnectionId: y.Id))
                    .GroupBy(
                        x => (
                            x.Match.Consumed.ConsumedService,
                            x.Match.Provided.ProvidedService,
                            new Maybe<UniqueId>(x.ConnectionId)),
                        x => x.Match.Provided);
            }
            var discoveredServices =
                from s in groupedMethods
                let consumedService = s.Key.ConsumedService
                let providedService = s.Key.ProvidedService
                let connectionId = s.Key.ConnectionId
                select _protocol.MessageFactory.CreateDiscoveredService(
                    _protocol.MessageFactory.CreateConsumedServiceReference(
                        consumedService.Service.Id,
                        consumedService.Alias),
                    _protocol.MessageFactory.CreateProvidedServiceReference(
                        providedService.Service.Id,
                        providedService.Alias, 
                        providedService.Application.Id, 
                        connectionId),
                    s.Key.ProvidedService.Title,
                    s.Select(m =>
                        _protocol.MessageFactory.CreateDiscoveredServiceMethod(
                            m.Method.Name,
                            m.Title,
                            m.Method.InputMessage.Id,
                            m.Method.OutputMessage.Id,
                            Convert(m.Method.Type))).ToList());
            using (var response = _protocol.MessageFactory.CreateServiceDiscoveryResponse(discoveredServices.ToList()))
            {
                Log.Info("Completed service discovery request {{{0}}} from {{{1}}}: {2}", request, sourceConnection, response);
                var serializedResponse = _protocol.Serializer.Serialize(response);
                try
                {
                    await sourceChannel.Out
                        .WriteAsync(new TransportMessageFrame(serializedResponse))
                        .ConfigureAwait(false);
                }
                catch
                {
                    serializedResponse.Dispose();
                    throw;
                }
            }
        }

        public async Task HandleAsync(
            IMethodDiscoveryRequest request, 
            IAppConnection sourceConnection,
            ITransportChannel sourceChannel)
        {
            Log.Info("Handling method discovery request {{{0}}} from {{{1}}}", request, sourceConnection);
            var appId = sourceConnection.Info.ApplicationId;
            IEnumerable<IProvidedMethod> matchingProvidedMethods =
                request.ConsumedMethod.HasValue
                    ? _registryService.GetMatchingProvidedMethods(appId, request.ConsumedMethod.Value)
                    : _registryService.GetMatchingProvidedMethods(appId);
            if (request.InputMessageId.HasValue)
            {
                matchingProvidedMethods = matchingProvidedMethods
                    .Where(x => string.Equals(x.Method.InputMessage.Id, request.InputMessageId.Value));
            }
            if (request.OutputMessageId.HasValue)
            {
                matchingProvidedMethods = matchingProvidedMethods
                    .Where(x => string.Equals(x.Method.OutputMessage.Id, request.OutputMessageId.Value));
            }
            IEnumerable<IDiscoveredMethod> discoveredMethods;
            if (request.DiscoveryMode == DiscoveryMode.Online)
            {
                var onlineConnections = _connectionTracker.GetOnlineConnections();
                discoveredMethods = matchingProvidedMethods
                    .Join(
                        onlineConnections,
                        x => x.ProvidedService.Application.Id,
                        y => y.Info.ApplicationId,
                        (method, connection) => (method, connection))
                    .Select(pm => Convert(pm.method, pm.connection.Id));
            }
            else
            {
                discoveredMethods = matchingProvidedMethods
                    .Select(pm => Convert(pm, Maybe<UniqueId>.Nothing));
            }
            using (var response = _protocol.MessageFactory.CreateMethodDiscoveryResponse(discoveredMethods.ToList()))
            {
                Log.Info("Completed method discovery request {{{0}}} from {{{1}}}: {2}", request, sourceConnection, response);
                var serializedResponse = _protocol.Serializer.Serialize(response);
                try
                {                    
                    await sourceChannel.Out
                        .WriteAsync(new TransportMessageFrame(serializedResponse))
                        .ConfigureAwait(false);
                }
                catch
                {
                    serializedResponse.Dispose();
                    throw;
                }
            }
        }

        private IDiscoveredMethod Convert(IProvidedMethod pm, Maybe<UniqueId> connectionId)
        {
            return _protocol.MessageFactory.CreateDiscoveredMethod(
                _protocol.MessageFactory.CreateProvidedMethodReference(
                    _protocol.MessageFactory.CreateProvidedServiceReference(
                        pm.ProvidedService.Service.Id,
                        pm.ProvidedService.Alias,
                        pm.ProvidedService.Application.Id,
                        connectionId),
                    pm.Method.Name),
                pm.Title,
                pm.Method.InputMessage.Id,
                pm.Method.OutputMessage.Id,
                Convert(pm.Method.Type));
        }

        private static MethodType Convert(Metamodel.MethodType methodType)
        {
            switch (methodType)
            {
                case Metamodel.MethodType.Unary:
                    return MethodType.Unary;
                case Metamodel.MethodType.ServerStreaming:
                    return MethodType.ServerStreaming;
                case Metamodel.MethodType.ClientStreaming:
                    return MethodType.ClientStreaming;
                case Metamodel.MethodType.DuplexStreaming:
                    return MethodType.DuplexStreaming;
                default:
                    throw new ArgumentOutOfRangeException(nameof(methodType), methodType, null);
            }
        }
    }
}
