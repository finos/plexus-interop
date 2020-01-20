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
namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Apps;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Transport;
    using System;
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;

    internal sealed class InvocationRequestHandler : IInvocationRequestHandler
    {
        private static readonly ILogger Log = LogManager.GetLogger<InvocationRequestHandler>();
        
        private readonly Stopwatch _stopwatch = new Stopwatch();
        private readonly IAppLifecycleManager _appLifecycleManager;
        private readonly IRegistryService _registryService;
        private readonly IInvocationEventProvider _invocationEventProvider;
        private readonly IContextLinkageManager _contextLinkageManager;
        private readonly IProtocolMessageFactory _protocolMessageFactory;
        private readonly IProtocolSerializer _protocolSerializer;
        private readonly InvocationTargetHandler<IInvocationStartRequested, IAppConnection> _createRequestHandler;
        private readonly InvocationTargetHandler<ValueTask<IAppConnection>, IAppConnection, IContextLinkageOptions> _resolveTargetConnectionHandler;

        private readonly object _resolveConnectionSync = new object();

        public InvocationRequestHandler(
            IAppLifecycleManager appLifecycleManager,
            IProtocolImplementation protocol,
            IRegistryService registryService,
            IInvocationEventProvider invocationEventProvider,
            IContextLinkageManager contextLinkageManager)
        {
            _appLifecycleManager = appLifecycleManager;            
            _protocolMessageFactory = protocol.MessageFactory;
            _protocolSerializer = protocol.Serializer;
            _registryService = registryService;
            _invocationEventProvider = invocationEventProvider;
            _contextLinkageManager = contextLinkageManager;
            _createRequestHandler = new InvocationTargetHandler<IInvocationStartRequested, IAppConnection>(CreateInvocationTarget, CreateInvocationTarget);
            _resolveTargetConnectionHandler = new InvocationTargetHandler<ValueTask<IAppConnection>, IAppConnection, IContextLinkageOptions>(ResolveTargetConnectionAsync, ResolveTargetConnectionAsync);
            _stopwatch.Start();
        }
        
        public async Task HandleAsync(IInvocationStart request, IAppConnection sourceConnection, ITransportChannel sourceChannel)
        {
            IAppConnection targetConnection = null;
            ITransportChannel targetChannel = null;
            InvocationDescriptor callDescriptor = null;
            var startMs = _stopwatch.ElapsedMilliseconds;
            try
            {
                Log.Info("Handling invocation {0} from {{{1}}}: {{{2}}}", sourceChannel.Id, sourceConnection, request);
                targetConnection = await request.Target.Handle(_resolveTargetConnectionHandler, sourceConnection, request.ContextLinkageOptions).ConfigureAwait(false);
                targetChannel = await targetConnection.CreateChannelAsync().ConfigureAwait(false);
                Log.Debug("Created channel {0} for invocation {1} from {{{2}}} to {{{3}}}: {{{4}}}", targetChannel.Id, sourceChannel.Id, sourceConnection, targetConnection, request);
                using (var invocationStarting = _protocolMessageFactory.CreateInvocationStarting())
                {
                    var serialized = _protocolSerializer.Serialize(invocationStarting);
                    try
                    {
                        await sourceChannel.Out.WriteAsync(new TransportMessageFrame(serialized)).ConfigureAwait(false);
                        Log.Trace("Sent starting event for invocation {0}", sourceChannel.Id);
                    }
                    catch
                    {
                        serialized.Dispose();
                        throw;
                    }
                }                
                using (var invocationRequested = request.Target.Handle(_createRequestHandler, sourceConnection))
                {
                    startMs = _stopwatch.ElapsedMilliseconds;
                    callDescriptor = new InvocationDescriptor(
                        sourceConnection.Info, 
                        targetConnection.Info, 
                        invocationRequested.ServiceId, 
                        invocationRequested.ServiceAlias.GetValueOrDefault(), 
                        invocationRequested.MethodId);
                    _invocationEventProvider.OnInvocationStarted(new InvocationStartedEventDescriptor(callDescriptor));
                    var serialized = _protocolSerializer.Serialize(invocationRequested);
                    try
                    {
                        await targetChannel.Out.WriteAsync(new TransportMessageFrame(serialized)).ConfigureAwait(false);
                        Log.Trace("Sent requested event for invocation {0} to {1}", targetChannel.Id, targetConnection);
                    }
                    catch
                    {
                        serialized.Dispose();
                        throw;
                    }
                }
                var propagateTask1 = TaskRunner.RunInBackground(() => PropagateAsync(sourceChannel, targetChannel));
                var propagateTask2 = TaskRunner.RunInBackground(() => PropagateAsync(targetChannel, sourceChannel));
                await Task.WhenAll(propagateTask1, propagateTask2).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                sourceChannel.Out.TryTerminate(ex);
                targetChannel?.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                try
                {
                    await Task
                        .WhenAll(
                            targetChannel?.In.ConsumeAsync((Action<TransportMessageFrame>)DisposeFrame).IgnoreExceptions() ?? TaskConstants.Completed,
                            sourceChannel.In.ConsumeAsync((Action<TransportMessageFrame>)DisposeFrame).IgnoreExceptions(),
                            targetChannel?.Completion ?? TaskConstants.Completed,
                            sourceChannel.Completion)
                        .ConfigureAwait(false);
                    Log.Info("Completed invocation {0} from {{{1}}} to {{{2}}}: {{{3}}}", sourceChannel.Id, sourceConnection, targetConnection, request);
                    OnActionFinished(callDescriptor, InvocationResult.Succeeded, startMs);
                }
                catch (OperationCanceledException)
                {
                    Log.Info("Canceled invocation {0} from {{{1}}} to {{{2}}}: {{{3}}}", sourceChannel.Id, sourceConnection, targetConnection, request);
                    OnActionFinished(callDescriptor, InvocationResult.Canceled, startMs);
                    throw;
                }
                catch (Exception ex)
                {
                    Log.Warn("Failed invocation {0} from {{{1}}} to {{{2}}}: {{{3}}}. Error: {4}", sourceChannel.Id, sourceConnection, targetConnection, request, ex.FormatTypeAndMessage());
                    OnActionFinished(callDescriptor, InvocationResult.Failed, startMs);
                    throw;
                }
            }
        }

        private void OnActionFinished(InvocationDescriptor callDescriptor, InvocationResult callResult, long startMs)
        {
            if (callDescriptor == null)
            {
                return;
            }
            _invocationEventProvider.OnInvocationFinished(
                new InvocationFinishedEventDescriptor(
                    callDescriptor,
                    callResult,
                    _stopwatch.ElapsedMilliseconds - startMs));
        }

        private async ValueTask<IAppConnection> ResolveTargetConnectionAsync(
            IProvidedMethodReference methodReference, 
            IAppConnection source, 
            IContextLinkageOptions contextLinkageOptions)
        {
            var method = _registryService.GetProvidedMethod(methodReference);
            var launchMode = GetLaunchMode(method);
            var appId = methodReference.ProvidedService.ApplicationId;
            if (methodReference.ProvidedService.ConnectionId.HasValue)
            {
                var connectionId = methodReference.ProvidedService.ConnectionId.Value;
                if (!_appLifecycleManager.TryGetOnlineConnection(connectionId, out var connection))
                {
                    throw new InvalidOperationException($"The requested app {appId} connection {connectionId} is not online");
                }
                return connection;
            }
            Task<ResolvedConnection> resolveTask;
            lock (_resolveConnectionSync)
            {
                if (launchMode != LaunchMode.MultiInstance)
                {
                    var onlineConnections = _appLifecycleManager
                        .GetOnlineConnections()
                        .Where(x => x.Info.ApplicationId.Equals(appId) &&
                                    !x.Id.Equals(source.Id)).ToArray();

                    if (_contextLinkageManager.IsContextShouldBeConsidered(contextLinkageOptions, source))
                    {
                        onlineConnections = _contextLinkageManager
                            .GetAppsInContexts(contextLinkageOptions, source, true)
                            .Join(onlineConnections, x => x.ConnectionId.Value, y => y.Id, (x, y) => y)
                            .ToArray();
                    }

                    if (onlineConnections.Any())
                    {
                        return onlineConnections.First();
                    }
                }

                if (launchMode == LaunchMode.None || !_appLifecycleManager.CanBeLaunched(appId))
                {
                    throw new InvalidOperationException(
                        $"The requested app {appId} is not online and cannot be launched");
                }

                var resolveMode = ConvertToResolveMode(launchMode);

                resolveTask = _appLifecycleManager.LaunchAndConnectionAsync(appId, resolveMode, source.Info);
            }
            var resolvedConnection = await resolveTask.ConfigureAwait(false);
            return resolvedConnection.AppConnection;
        }

        private async ValueTask<IAppConnection> ResolveTargetConnectionAsync(
            IConsumedMethodReference method, 
            IAppConnection source,
            IContextLinkageOptions contextLinkageOptions)
        {
            Log.Debug("Resolving target connection for call {{{0}}} from {{{1}}}", method, source);
            string appId;
            ResolveMode resolveMode;
            var targetMethods = _registryService.GetMatchingProvidedMethods(source.Info.ApplicationId, method);
            var onlineProvidedMethods =
                _appLifecycleManager
                    .GetOnlineConnections()
                    .Where(x => !x.Id.Equals(source.Id))
                    .Join(
                        targetMethods.Where(x => GetLaunchMode(x) != LaunchMode.MultiInstance),
                        x => x.Info.ApplicationId, y => y.ProvidedService.Application.Id,
                        (x, y) => (Method: y, AppConnection: x))
                    .ToArray();

            if (_contextLinkageManager.IsContextShouldBeConsidered(contextLinkageOptions, source))
            {
                onlineProvidedMethods = _contextLinkageManager.GetAppsInContexts(contextLinkageOptions, source, true)
                    .Join(onlineProvidedMethods, x => x.ConnectionId.Value, y => y.AppConnection.Id, (x, y) => y).ToArray();
            }

            if (onlineProvidedMethods.Any())
            {
                var connection = onlineProvidedMethods.First().AppConnection;
                Log.Debug("Resolved target connection for call {{{0}}} from {{{1}}} to online connection: {{{2}}}", method, source, connection);
                return connection;
            }

            lock (_resolveConnectionSync)
            {
                Log.Debug("Resolving target connection for call {{{0}}} from {{{1}}} to offline connection", method, source);
                var appIds = _appLifecycleManager.FilterCanBeLaunched(
                    targetMethods.Select(x => x.ProvidedService.Application.Id).Distinct());
                targetMethods = targetMethods.Join(appIds, x => x.ProvidedService.Application.Id, y => y, (x, y) => x).ToArray();
                var singleInstanceMethods = targetMethods
                    .Where(x => GetLaunchMode(x) == LaunchMode.SingleInstance)
                    .ToArray();
                var candidate = singleInstanceMethods.FirstOrDefault(x => !x.ProvidedService.Application.Id.Equals(source.Info.ApplicationId));
                resolveMode = ResolveMode.SingleInstance;
                if (candidate == null)
                {
                    candidate = singleInstanceMethods.FirstOrDefault();
                    resolveMode = ResolveMode.SingleInstance;
                }
                if (candidate == null)
                {
                    candidate = targetMethods.FirstOrDefault(x => GetLaunchMode(x) == LaunchMode.MultiInstance);
                    resolveMode = ResolveMode.MultiInstance;
                }
                if (candidate == null)
                {
                    throw new InvalidOperationException($"Cannot resolve target for invocation {{{method}}} from {{{source}}}");
                }
                Log.Debug("Resolved target connection for call {{{0}}} from {{{1}}} to provided method {{{2}}}", method, source, candidate);
                appId = candidate.ProvidedService.Application.Id;
            }
            var resolvedConnection = await _appLifecycleManager
                .LaunchAndConnectionAsync(appId, resolveMode, source.Info)
                .ConfigureAwait(false);

            return resolvedConnection.AppConnection;
        }

        private static ResolveMode ConvertToResolveMode(LaunchMode launchMode)
        {
            switch (launchMode)
            {
                case LaunchMode.SingleInstance:
                    return ResolveMode.SingleInstance;
                case LaunchMode.MultiInstance:
                    return ResolveMode.MultiInstance;
                default:
                    throw new ArgumentOutOfRangeException(nameof(launchMode), launchMode, null);
            }
        }

        private static LaunchMode GetLaunchMode(IProvidedMethod method)
        {
            return method.LaunchMode.HasValue
                ? method.LaunchMode.Value
                : method.ProvidedService.LaunchMode.HasValue
                    ? method.ProvidedService.LaunchMode.Value
                    : method.ProvidedService.Application.LaunchMode.HasValue
                        ? method.ProvidedService.Application.LaunchMode.Value
                        : LaunchMode.None;
        }

        private IInvocationStartRequested CreateInvocationTarget(IProvidedMethodReference reference, IAppConnection sourceConnection)
        {
            return _protocolMessageFactory.CreateInvocationStartRequested(
                reference.ProvidedService.ServiceId,
                reference.MethodId,
                reference.ProvidedService.ServiceAlias,
                sourceConnection.Info.ApplicationId,
                sourceConnection.Info.ApplicationInstanceId,
                sourceConnection.Id);
        }

        private IInvocationStartRequested CreateInvocationTarget(IConsumedMethodReference reference, IAppConnection sourceConnection)
        {
            return _protocolMessageFactory.CreateInvocationStartRequested(
                reference.ConsumedService.ServiceId,
                reference.MethodId,
                reference.ConsumedService.ServiceAlias,
                sourceConnection.Info.ApplicationId,
                sourceConnection.Info.ApplicationInstanceId,
                sourceConnection.Id);
        }

        private static void DisposeFrame(TransportMessageFrame frame)
        {
            frame.Dispose();
        }

        private static async Task PropagateAsync(ITransportChannel source, ITransportChannel target)
        {
            try
            {
                int propagatedMessageCount = 0;
                while (true)
                {
                    Log.Trace($"Waiting for TransportMessageFrame from {source.Id} to propagate to {target.Id}");

                    var result = await source.In.TryReadAsync().ConfigureAwait(false);

                    if (!result.HasValue)
                    {
                        Log.Trace($"Received empty TransportMessageFrame from {source.Id}. Will complete {target.Id} channel");
                        break;
                    }

                    var messageFrame = result.Value;

                    Log.Trace($"Received TransportMessageFrame {messageFrame} from {source.Id}. Will try to propagate it to {target.Id} channel");
                    await target.Out.WriteAsync(messageFrame).ConfigureAwait(false);

                    propagatedMessageCount++;

                    Log.Trace($"TransportMessageFrame {messageFrame} successfully propagated to {target.Id} (received from {source.Id})");
                }

                target.Out.TryComplete();
                Log.Trace($"Successfully completed TransportMessageFrame propagation from {source.Id} to {target.Id}. Total {propagatedMessageCount} messages propagated");
            }
            catch (Exception ex)
            {
                Log.Warn($"Caught exception during attempt to propagate TransportMessageFrame from {source.Id} to {target.Id}", ex);
                target.Out.TryTerminate(ex);
            }
        }
    }
}
