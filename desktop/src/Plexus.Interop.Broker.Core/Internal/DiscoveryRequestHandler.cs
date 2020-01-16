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
namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Apps;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Discovery;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using MethodType = Plexus.Interop.Protocol.Discovery.MethodType;

    internal sealed class DiscoveryRequestHandler : IDiscoveryRequestHandler
    {
        private static readonly ILogger Log = LogManager.GetLogger<DiscoveryRequestHandler>();

        private readonly IProtocolImplementation _protocol;
        private readonly IRegistryService _registryService;
        private readonly IContextLinkageManager _contextLinkageManager;
        private readonly IAppLifecycleManager _appLifecycleManager;

        public DiscoveryRequestHandler(
            IAppLifecycleManager appLifecycleManager,
            IProtocolImplementation protocol,
            IRegistryService registryService,
            IContextLinkageManager contextLinkageManager)
        {
            _appLifecycleManager = appLifecycleManager;
            _protocol = protocol;
            _registryService = registryService;
            _contextLinkageManager = contextLinkageManager;
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
            IEnumerable<IGrouping<(IConsumedService ConsumedService, IProvidedService ProvidedService, Maybe<UniqueId> ConnectionId, Maybe<UniqueId> ApplicationInstanceId), IProvidedMethod>> groupedMethods;

            var online = request.DiscoveryMode == DiscoveryMode.Online;
            IReadOnlyCollection<string> contexts;
            if (request.ContextLinkageOptions.Mode != ContextLinkageDiscoveryMode.None 
                && (contexts = GetContextsIds(request.ContextLinkageOptions, sourceConnection)).Any())
            {
                groupedMethods = _contextLinkageManager.GetAppsInContexts(contexts, online)
                    .Join(methodMatches, x => x.AppId, y => y.Provided.ProvidedService.Service.Id,
                        (x, y) => (y.Consumed, y.Provided, x.AppInstanceId, x.ConnectionId))
                    .GroupBy(x => (x.Consumed.ConsumedService, x.Provided.ProvidedService, x.ConnectionId, new Maybe<UniqueId>(x.AppInstanceId)), x => x.Provided);
            }
            else
            {
                if (online)
                {
                    var onlineConnections = _appLifecycleManager.GetOnlineConnections();
                    groupedMethods = methodMatches
                        .Join(onlineConnections, x => x.Provided.ProvidedService.Application.Id,
                            y => y.Info.ApplicationId,
                            (x, y) => (Match: x, ConnectionId: y.Id, y.Info.ApplicationInstanceId))
                        .GroupBy(
                            x => (
                                x.Match.Consumed.ConsumedService,
                                x.Match.Provided.ProvidedService,
                                new Maybe<UniqueId>(x.ConnectionId),
                                new Maybe<UniqueId>(x.ApplicationInstanceId)),
                            x => x.Match.Provided);
                }
                else
                {
                    var providerApps = methodMatches.Select(x => x.Provided.ProvidedService.Application.Id).Distinct()
                        .ToArray();
                    var availableProviderApps = FilterAvailableApps(providerApps);
                    groupedMethods = methodMatches
                        .Join(availableProviderApps, x => x.Provided.ProvidedService.Application.Id, y => y,
                            (x, y) => x)
                        .GroupBy(
                            x => (
                                x.Consumed.ConsumedService,
                                x.Provided.ProvidedService,
                                ConnectionId: Maybe<UniqueId>.Nothing,
                                ApplicationInstanceId: Maybe<UniqueId>.Nothing),
                            x => x.Provided);
                }
            }

            var discoveredServices =
                from s in groupedMethods
                let consumedService = s.Key.ConsumedService
                let providedService = s.Key.ProvidedService
                let connectionId = s.Key.ConnectionId
                let applicationInstanceId = s.Key.ApplicationInstanceId
                select _protocol.MessageFactory.CreateDiscoveredService(
                    _protocol.MessageFactory.CreateConsumedServiceReference(
                        consumedService.Service.Id,
                        consumedService.Alias),
                    _protocol.MessageFactory.CreateProvidedServiceReference(
                        providedService.Service.Id,
                        providedService.Alias,
                        providedService.Application.Id,
                        connectionId,
                        applicationInstanceId),
                    s.Key.ProvidedService.Title,
                    s.Select(m =>
                            _protocol.MessageFactory.CreateDiscoveredServiceMethod(
                                m.Method.Name,
                                m.Title,
                                m.Method.InputMessage.Id,
                                m.Method.OutputMessage.Id,
                                Convert(m.Method.Type),
                                m.Options.Select(o => _protocol.MessageFactory.CreateOption(o.Id, o.Value)).ToList()))
                        .ToList());
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

            IReadOnlyCollection<string> contexts;
            bool online = request.DiscoveryMode == DiscoveryMode.Online;
            if (request.ContextLinkageOptions.Mode != ContextLinkageDiscoveryMode.None
                && (contexts = GetContextsIds(request.ContextLinkageOptions, sourceConnection)).Any())
            {
                discoveredMethods = _contextLinkageManager.GetAppsInContexts(contexts, online)
                    .Join(matchingProvidedMethods, x => x.AppId, y => y.ProvidedService.Application.Id,
                        (connection, method) => (method, connection))
                    .Select(pm => Convert(pm.method, pm.connection.ConnectionId,
                        new Maybe<UniqueId>(pm.connection.AppInstanceId)));
            }
            else
            {
                if (online)
                {
                    var onlineConnections = _appLifecycleManager.GetOnlineConnections();
                    discoveredMethods = matchingProvidedMethods
                        .Join(
                            onlineConnections,
                            x => x.ProvidedService.Application.Id,
                            y => y.Info.ApplicationId,
                            (method, connection) => (method, connection))
                        .Select(pm => Convert(pm.method, pm.connection.Id, pm.connection.Info.ApplicationInstanceId));
                }
                else
                {
                    var providedMethods = matchingProvidedMethods.ToArray();
                    var providerApps = providedMethods.Select(x => x.ProvidedService.Application.Id).Distinct().ToArray();
                    var availableProviderApps = FilterAvailableApps(providerApps);
                    discoveredMethods = providedMethods
                        .Join(availableProviderApps, x => x.ProvidedService.Application.Id, y => y, (x, y) => x)
                        .Select(pm => Convert(pm, Maybe<UniqueId>.Nothing, Maybe<UniqueId>.Nothing));
                }
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

        private IReadOnlyCollection<string> GetContextsIds(IContextLinkageOptions contextLinkageOptions, IAppConnection sourceConnection)
        {
            var mode = contextLinkageOptions.Mode;
            var contexts = mode == ContextLinkageDiscoveryMode.CurrentContext
                ? _contextLinkageManager.GetApplicationContexts(sourceConnection.Info.ApplicationInstanceId)
                : new[] { contextLinkageOptions.SpecificContext.Value};
            return contexts;
        }

        private IDiscoveredMethod Convert(IProvidedMethod pm, Maybe<UniqueId> connectionId, Maybe<UniqueId> appInstanceId)
        {
            return _protocol.MessageFactory.CreateDiscoveredMethod(
                _protocol.MessageFactory.CreateProvidedMethodReference(
                    _protocol.MessageFactory.CreateProvidedServiceReference(
                        pm.ProvidedService.Service.Id,
                        pm.ProvidedService.Alias,
                        pm.ProvidedService.Application.Id,
                        connectionId,
                        appInstanceId),
                    pm.Method.Name),
                pm.Title,
                pm.Method.InputMessage.Id,
                pm.Method.OutputMessage.Id,
                Convert(pm.Method.Type),
                pm.Options.Select(x => _protocol.MessageFactory.CreateOption(x.Id, x.Value)).ToList()
            );
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

        private IEnumerable<string> FilterAvailableApps(string[] providerApps)
        {
            var launchableProviderApps = _appLifecycleManager.FilterCanBeLaunched(providerApps);
            var onlineApps = _appLifecycleManager.GetOnlineConnections().Select(x => x.Info.ApplicationId).Distinct();
            var onlineProviderApps = providerApps.Intersect(onlineApps);
            var availableProviderApps = launchableProviderApps.Union(onlineProviderApps);
            return availableProviderApps;
        }
    }
}
