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
namespace Plexus.Interop.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Internal.Calls;
    using Plexus.Interop.Internal.ClientProtocol.Discovery;
    using Plexus.Interop.Internal.ClientProtocol.Invocations;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Transport;
    using Plexus.Processes;
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    internal sealed class Client : ProcessBase, IClient, IClientCallInvoker, IClientDiscoveryInvoker
    {        
        private readonly ClientOptions _options;
        private readonly BrokerToClientRequestHandler<Task, ITransportChannel> _incomingRequestHandler;
        private readonly ConcurrentDictionary<Task, Nothing> _runningTasks = new ConcurrentDictionary<Task, Nothing>();

        private ILogger _log = LogManager.GetLogger<Client>();
        private IOutcomingInvocationFactory _outcomingInvocationFactory;
        private IDiscoveryService _discoveryService;

        private IClientConnection _connection;

        public Client(ClientOptions options)
        {
            _options = options;
            _incomingRequestHandler = new BrokerToClientRequestHandler<Task, ITransportChannel>(HandleInvocationStartRequestAsync);            
        }

        public IClientCallInvoker CallInvoker => this;

        public IClientDiscoveryInvoker DiscoveryInvoker => this;

        public string ApplicationId => _options.ApplicationId;

        public UniqueId ApplicationInstanceId => _options.ApplicationInstanceId;

        public UniqueId ConnectionId { get; private set; }

        protected override async Task<Task> StartCoreAsync()
        {
            _log.Debug("Connecting {0}", _options);
            _connection = await ClientConnectionFactory.Instance
                .ConnectAsync(_options, CancellationToken)
                .ConfigureAwait(false);
            ConnectionId = _connection.Id;
            _log = LogManager.GetLogger<Client>(_connection.Id.ToString());
            _outcomingInvocationFactory =
                new OutcomingInvocationFactory(_connection, _options.Protocol, _options.Marshaller);
            _discoveryService = new DiscoveryService(ConnectionId, _connection, _options.Protocol);
            return ProcessAsync();
        }

        public Task ConnectAsync() => StartAsync();

        public void Disconnect() => Stop();

        public Task DisconnectAsync() => StopAsync();

        public IUnaryMethodCall Call<TRequest>(IUnaryMethod<TRequest, Nothing> method, TRequest request)
        {
            return CallUnary(method.CallDescriptor, request);
        }

        public IUnaryMethodCall CallUnary<TRequest>(MethodCallDescriptor descriptor, TRequest request)
        {
            _log.Debug("Starting unary call: {0}", descriptor);
            var call = new UnaryMethodCall<TRequest, Nothing>(() => _outcomingInvocationFactory.CreateAsync<TRequest, Nothing>(descriptor, request));
            call.Start();
            return call;
        }

        public IUnaryMethodCall<TResponse> Call<TRequest, TResponse>(IUnaryMethod<TRequest, TResponse> method, TRequest request)
        {
            return CallUnary<TRequest, TResponse>(method.CallDescriptor, request);
        }

        public IUnaryMethodCall<TResponse> CallUnary<TRequest, TResponse>(MethodCallDescriptor descriptor, TRequest request)
        {
            _log.Debug("Starting unary call: {0}", descriptor);
            var call = new UnaryMethodCall<TRequest, TResponse>(() => _outcomingInvocationFactory.CreateAsync<TRequest, TResponse>(descriptor, request));
            call.Start();
            return call;
        }

        public IServerStreamingMethodCall<TResponse> Call<TRequest, TResponse>(IServerStreamingMethod<TRequest, TResponse> method, TRequest request)
        {
            return CallServerStreaming<TRequest, TResponse>(method.CallDescriptor, request);
        }

        public IServerStreamingMethodCall<TResponse> CallServerStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor, TRequest request)
        {
            _log.Debug("Starting server streaming call: {0}", descriptor);
            var call = new ServerStreamingMethodCall<TRequest, TResponse>(() => _outcomingInvocationFactory.CreateAsync<TRequest, TResponse>(descriptor, request));
            call.Start();
            return call;
        }

        public IClientStreamingMethodCall<TRequest, TResponse> Call<TRequest, TResponse>(IClientStreamingMethod<TRequest, TResponse> method)
        {
            return CallClientStreaming<TRequest, TResponse>(method.CallDescriptor);
        }

        public IClientStreamingMethodCall<TRequest, TResponse> CallClientStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor)
        {
            _log.Debug("Starting client streaming call: {0}", descriptor);
            var call = new ClientStreamingMethodCall<TRequest, TResponse>(() => _outcomingInvocationFactory.CreateAsync<TRequest, TResponse>(descriptor));
            call.Start();
            return call;
        }

        public IDuplexStreamingMethodCall<TRequest, TResponse> Call<TRequest, TResponse>(IDuplexStreamingMethod<TRequest, TResponse> method)
        {
            return CallDuplexStreaming<TRequest, TResponse>(method.CallDescriptor);
        }

        public IDuplexStreamingMethodCall<TRequest, TResponse> CallDuplexStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor)
        {
            _log.Debug("Starting duplex streaming call: {0}", descriptor);
            var call = new DuplexStreamingMethodCall<TRequest, TResponse>(() => _outcomingInvocationFactory.CreateAsync<TRequest, TResponse>(descriptor));
            call.Start();
            return call;
        }

        public async Task<IReadOnlyCollection<DiscoveredMethod>> DiscoverAsync(MethodDiscoveryQuery query)
        {
            return await DiscoverInternalAsync(query).ConfigureAwait(false);
        }

        public async Task<IReadOnlyCollection<DiscoveredMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResults = await DiscoverInternalAsync(ConvertQuery(query)).ConfigureAwait(false);
            return discoveryResults.Select(x => new DiscoveredMethod<TRequest, TResponse>(x)).ToList();
        }

        public async Task<IReadOnlyCollection<DiscoveredMethod<TRequest, Nothing>>> DiscoverAsync<TRequest>(MethodDiscoveryQuery<TRequest, Nothing> query)
        {
            var discoveryResults = await DiscoverInternalAsync(ConvertQuery(query)).ConfigureAwait(false);
            return discoveryResults.Select(x => new DiscoveredMethod<TRequest, Nothing>(x)).ToList();
        }

        public async Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query)
        {
            var discoveryResults = await DiscoverInternalAsync(ConvertQuery(query), true).ConfigureAwait(false);
            return discoveryResults.Select(x => new DiscoveredOnlineMethod<TRequest, TResponse>(x)).ToList();
        }

        public async Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, Nothing>>> DiscoverOnlineAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, Nothing> query)
        {
            var discoveryResults = await DiscoverInternalAsync(ConvertQuery(query), true).ConfigureAwait(false);
            return discoveryResults.Select(x => new DiscoveredOnlineMethod<TRequest, Nothing>(x)).ToList();
        }

        public async Task<IReadOnlyCollection<DiscoveredService>> DiscoverAsync(ServiceDiscoveryQuery query)
        {
            return await DiscoverInternalAsync(query).ConfigureAwait(false);
        }

        public async Task<IReadOnlyCollection<DiscoveredOnlineService>> DiscoverOnlineAsync(ServiceDiscoveryQuery query)
        {
            var discoveryResults = await DiscoverInternalAsync(query, true).ConfigureAwait(false);
            return discoveryResults.Select(x => new DiscoveredOnlineService(x)).ToList();
        }

        private async Task ProcessAsync()
        {
            using (CancellationToken.Register(() => _connection.TryComplete(), false))
            {
                try
                {
                    _log.Debug("Connected. Listening to incoming invocations.");
                    await ListenIncomingInvocationsAsync(_connection).ConfigureAwait(false);
                    await _connection.Completion.ConfigureAwait(false);
                }
                catch (OperationCanceledException) when (CancellationToken.IsCancellationRequested)
                {
                }
                catch (Exception ex)
                {
                    _log.Debug("Connection terminated: {0}", ex.FormatTypeAndMessage());
                }
                finally
                {
                    _log.Debug("Connection closed. Awaiting for {0} active tasks completion.", _runningTasks.Count);
                    await Task.WhenAll(_runningTasks.Keys).IgnoreExceptions().ConfigureAwait(false);
                }
            }
        }

        private async Task ListenIncomingInvocationsAsync(ITransportConnection connection)
        {
            await connection
                .IncomingChannels
                .ConsumeAsync((Action<ITransportChannel>)HandleIncomingChannel)
                .IgnoreExceptions()
                .ConfigureAwait(false);
        }

        private void HandleIncomingChannel(ITransportChannel channel)
        {
            var channelHandleTask = TaskRunner.RunInBackground(HandleIncomingChannelAsync, channel);
            _runningTasks[channelHandleTask] = Nothing.Instance;
            channelHandleTask.ContinueWithSynchronously((Action<Task>)OnTaskCompleted);
        }

        private void OnTaskCompleted(Task task)
        {
            _runningTasks.TryRemove(task, out _);
        }

        private async Task HandleIncomingChannelAsync(object state)
        {
            var channel = (ITransportChannel)state;
            try
            {                
                try
                {
                    using (var msg = await channel.In.ReadAsync().ConfigureAwait(false))
                    using (var request = _options.Protocol.Serializer.DeserializeBrokerToClientRequest(msg.Payload))
                    {
                        await request.Handle(_incomingRequestHandler, channel).ConfigureAwait(false);
                    }
                }
                catch (Exception ex)
                {
                    channel.Out.TryTerminate(ex);
                    await channel.In.ConsumeAsync(x => { }).IgnoreExceptions().ConfigureAwait(false);
                }
                finally
                {
                    await channel.Completion.IgnoreExceptions().ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                _log.Warn("Exception while handling incoming channel {0}: {1}", channel.Id, ex.FormatTypeAndMessage());
            }
        }

        private async Task HandleInvocationStartRequestAsync(IInvocationStartRequested request, ITransportChannel channel)
        {
            _log.Debug("Handling invocation start request: {0}", request);
            if (!_options.ServicesDictionary.TryGetValue((request.ServiceId, request.ServiceAlias), out var providedService))
            {
                throw new InvalidOperationException($"Service implementation with alias {request.ServiceAlias} not provided: {request.ServiceId}");
            }
            if (!providedService.CallHandlers.TryGetValue(request.MethodId, out var callHandler))
            {
                throw new InvalidOperationException($"Method implementation with alias {request.ServiceAlias} not provided: {request.ServiceId}.{request.MethodId}");
            }
            var invocationInfo =
                new IncomingInvocationDescriptor(
                    new InvocationMethodDescriptor(
                        request.ServiceId,
                        request.MethodId,
                        request.ServiceAlias),
                    new InvocationSourceDescriptor(
                        request.ConsumerApplicationId,
                        request.ConsumerConnectionId));
            await callHandler.HandleAsync(invocationInfo, channel).ConfigureAwait(false);
        }

        private MethodDiscoveryQuery ConvertQuery<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query)
        {
            Maybe<string> inputMessageId = default;
            Maybe<string> outputMessageId = default;
            if (typeof(TRequest) != typeof(Nothing))
            {
                inputMessageId = _options.Marshaller.GetMarshaller<TRequest>().MessageId;
            }
            if (typeof(TResponse) != typeof(Nothing))
            {
                outputMessageId = _options.Marshaller.GetMarshaller<TResponse>().MessageId;
            }
            return new MethodDiscoveryQuery(query.MethodReference, inputMessageId, outputMessageId);
        }

        private Task<IReadOnlyCollection<DiscoveredMethod>> DiscoverInternalAsync(
            MethodDiscoveryQuery query, bool online = false)
        {
            var task = TaskRunner.RunInBackground(async () =>
            {
                _log.Debug("Method discovery {0}", query);
                var response = await _discoveryService.DiscoverAsync(query, online).ConfigureAwait(false);
                _log.Debug("Method discovery response: {0}", response);
                return response;
            });
            _runningTasks[task] = Nothing.Instance;
            ((Task)task).ContinueWithSynchronously((Action<Task>)OnTaskCompleted);
            return task;
        }

        private Task<IReadOnlyCollection<DiscoveredService>> DiscoverInternalAsync(
            ServiceDiscoveryQuery query, bool online = false)
        {
            var task = TaskRunner.RunInBackground(async () =>
            {
                _log.Debug("Service discovery {0}", query);
                var response = await _discoveryService.DiscoverAsync(query, online).ConfigureAwait(false);
                _log.Debug("Service discovery response: {0}", response.FormatEnumerable());
                return response;
            });
            _runningTasks[task] = Nothing.Instance;
            ((Task)task).ContinueWithSynchronously((Action<Task>)OnTaskCompleted);
            return task;
        }
    }
}
