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
﻿namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Transport;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    internal sealed class InvocationRequestHandler : IInvocationRequestHandler
    {
        private static readonly ILogger Log = LogManager.GetLogger<InvocationRequestHandler>();

        private readonly IClientConnectionTracker _clientConnectionTracker;
        private readonly IRegistryService _registryService;
        private readonly IProtocolMessageFactory _protocolMessageFactory;
        private readonly IProtocolSerializer _protocolSerializer;
        private readonly InvocationTargetHandler<IInvocationStartRequested, IClientConnection> _createRequestHandler;
        private readonly InvocationTargetHandler<ValueTask<IClientConnection>, IClientConnection> _resolveTargetConnectionHandler;

        public InvocationRequestHandler(
            IClientConnectionTracker clientConnectionTracker,
            IProtocolImplementation protocol,
            IRegistryService registryService)
        {
            _clientConnectionTracker = clientConnectionTracker;            
            _protocolMessageFactory = protocol.MessageFactory;
            _protocolSerializer = protocol.Serializer;
            _registryService = registryService;
            _createRequestHandler = new InvocationTargetHandler<IInvocationStartRequested, IClientConnection>(CreateInvocationTarget, CreateInvocationTarget);
            _resolveTargetConnectionHandler = new InvocationTargetHandler<ValueTask<IClientConnection>, IClientConnection>(ResolveTargetConnectionAsync, ResolveTargetConnectionAsync);
        }
        
        public async Task HandleAsync(IInvocationStart request, IClientConnection sourceConnection, ITransportChannel sourceChannel)
        {
            Log.Info("Handling invocation request {0} from {1}: {2}", sourceChannel.Id, sourceConnection.Id, request);
            var targetConnection = await request.Target.Handle(_resolveTargetConnectionHandler, sourceConnection).ConfigureAwait(false);
            var targetChannel = await targetConnection.CreateChannelAsync().ConfigureAwait(false);
            Log.Debug("Created target channel {0} for invocation {1} to {2}", targetChannel.Id, sourceChannel.Id, targetConnection);
            try
            {
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
                var propagateTask1 = TaskRunner.RunInBackground(() => PropagateAsync(sourceChannel.In, targetChannel.Out));
                var propagateTask2 = TaskRunner.RunInBackground(() => PropagateAsync(targetChannel.In, sourceChannel.Out));
                await Task.WhenAll(propagateTask1, propagateTask2).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                sourceChannel.Out.TryTerminate(ex);
                targetChannel.Out.TryTerminate(ex);
                throw;
            }
            finally
            {
                try
                {
                    await Task
                        .WhenAll(
                            targetChannel.In.ConsumeAsync((Action<TransportMessageFrame>)DisposeFrame).IgnoreExceptions(),
                            sourceChannel.In.ConsumeAsync((Action<TransportMessageFrame>)DisposeFrame).IgnoreExceptions(),
                            targetChannel.Completion,
                            sourceChannel.Completion)
                        .ConfigureAwait(false);
                    Log.Info("Completed invocation {0} from {{{1}}} to {{{2}}}: {{{3}}}", sourceChannel.Id, sourceConnection, targetConnection, request);
                }
                catch (OperationCanceledException)
                {
                    Log.Info("Canceled invocation {0} from {{{1}}} to {{{2}}}: {{{3}}}", sourceChannel.Id, sourceConnection, targetConnection, request);
                    throw;
                }
                catch (Exception ex)
                {
                    Log.Warn("Failed invocation {0} from {{{1}}} to {{{2}}}: {{{3}}}. Error: {4}", sourceChannel.Id, sourceConnection, targetConnection, request, ex.FormatTypeAndMessage());
                    throw;
                }
            }
        }

        private ValueTask<IClientConnection> ResolveTargetConnectionAsync(
            IProvidedMethodReference method, 
            IClientConnection source)
        {
            if (method.ProvidedService.ConnectionId.HasValue)
            {
                var connectionId = method.ProvidedService.ConnectionId.Value;
                if (!_clientConnectionTracker.TryGetOnlineConnection(connectionId, out var connection))
                {
                    throw new InvalidOperationException($"The requested connection {connectionId} is not online");
                }
                return new ValueTask<IClientConnection>(connection);
            }
            return _clientConnectionTracker.GetOrSpawnConnectionAsync(new[] {method.ProvidedService.ApplicationId});
        }

        private ValueTask<IClientConnection> ResolveTargetConnectionAsync(
            IConsumedMethodReference method, 
            IClientConnection source)
        {
            var targetMethods = _registryService.GetMatchingProvidedMethods(source.Info.ApplicationId, method);
            var targetApps = targetMethods.Select(x => x.ProvidedService.Application.Id).ToList();
            return _clientConnectionTracker.GetOrSpawnConnectionAsync(targetApps);
        }

        private IInvocationStartRequested CreateInvocationTarget(IProvidedMethodReference reference, IClientConnection sourceConnection)
        {
            return _protocolMessageFactory.CreateInvocationStartRequested(
                reference.ProvidedService.ServiceId,
                reference.MethodId,
                reference.ProvidedService.ServiceAlias,
                sourceConnection.Info.ApplicationId,
                sourceConnection.Id);
        }

        private IInvocationStartRequested CreateInvocationTarget(IConsumedMethodReference reference, IClientConnection sourceConnection)
        {
            return _protocolMessageFactory.CreateInvocationStartRequested(
                reference.ConsumedService.ServiceId,
                reference.MethodId,
                reference.ConsumedService.ServiceAlias,
                sourceConnection.Info.ApplicationId,
                sourceConnection.Id);
        }

        private static void DisposeFrame(TransportMessageFrame frame)
        {
            frame.Dispose();
        }

        private static async Task PropagateAsync(IReadableChannel<TransportMessageFrame> channel1, IWritableChannel<TransportMessageFrame> channel2)
        {
            try
            {
                while (true)
                {
                    var result = await channel1.TryReadAsync().ConfigureAwait(false);
                    if (!result.HasValue)
                    {
                        break;
                    }
                    await channel2.WriteAsync(result.Value).ConfigureAwait(false);
                }
                channel2.TryComplete();
            }
            catch (Exception ex)
            {
                channel2.TryTerminate(ex);
            }
        }
    }
}
