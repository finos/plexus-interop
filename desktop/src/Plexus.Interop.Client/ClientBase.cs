namespace Plexus.Interop
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public abstract class ClientBase : IClient
    {
        private readonly IClient _client;

        protected ClientBase(ClientOptions options)
        {
            _client = ClientFactory.Instance.Create(options);
        }

        public string ApplicationId => _client.ApplicationId;

        public UniqueId ApplicationInstanceId => _client.ApplicationInstanceId;

        public UniqueId ConnectionId => _client.ConnectionId;

        public Task Completion => _client.Completion;

        public IUnaryMethodCall Call<TRequest>(IUnaryMethod<TRequest, Nothing> method, TRequest request)
        {
            return _client.Call(method, request);
        }

        public IUnaryMethodCall CallUnary<TRequest>(MethodCallDescriptor descriptor, TRequest request)
        {
            return _client.CallUnary(descriptor, request);
        }

        public IUnaryMethodCall<TResponse> Call<TRequest, TResponse>(IUnaryMethod<TRequest, TResponse> method, TRequest request)
        {
            return _client.Call(method, request);
        }

        public IUnaryMethodCall<TResponse> CallUnary<TRequest, TResponse>(MethodCallDescriptor descriptor, TRequest request)
        {
            return _client.CallUnary<TRequest, TResponse>(descriptor, request);
        }

        public IServerStreamingMethodCall<TResponse> Call<TRequest, TResponse>(IServerStreamingMethod<TRequest, TResponse> method, TRequest request)
        {
            return _client.Call(method, request);
        }

        public IServerStreamingMethodCall<TResponse> CallServerStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor, TRequest request)
        {
            return _client.CallServerStreaming<TRequest, TResponse>(descriptor, request);
        }

        public IClientStreamingMethodCall<TRequest, TResponse> Call<TRequest, TResponse>(IClientStreamingMethod<TRequest, TResponse> method)
        {
            return _client.Call(method);
        }

        public IClientStreamingMethodCall<TRequest, TResponse> CallClientStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor)
        {
            return _client.CallClientStreaming<TRequest, TResponse>(descriptor);
        }

        public IDuplexStreamingMethodCall<TRequest, TResponse> Call<TRequest, TResponse>(IDuplexStreamingMethod<TRequest, TResponse> method)
        {
            return _client.Call(method);
        }

        public IDuplexStreamingMethodCall<TRequest, TResponse> CallDuplexStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor)
        {
            return _client.CallDuplexStreaming<TRequest, TResponse>(descriptor);
        }

        public Task<IReadOnlyCollection<DiscoveredMethod>> DiscoverAsync(MethodDiscoveryQuery query)
        {
            return _client.DiscoverAsync(query);
        }

        public Task<IReadOnlyCollection<DiscoveredMethod<TRequest, TResponse>>> DiscoverAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query)
        {
            return _client.DiscoverAsync(query);
        }

        public Task<IReadOnlyCollection<DiscoveredMethod<TRequest, Nothing>>> DiscoverAsync<TRequest>(MethodDiscoveryQuery<TRequest, Nothing> query)
        {
            return _client.DiscoverAsync(query);
        }

        public Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, TResponse>>> DiscoverOnlineAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, TResponse> query)
        {
            return _client.DiscoverOnlineAsync(query);
        }

        public Task<IReadOnlyCollection<DiscoveredOnlineMethod<TRequest, Nothing>>> DiscoverOnlineAsync<TRequest, TResponse>(MethodDiscoveryQuery<TRequest, Nothing> query)
        {
            return _client.DiscoverOnlineAsync<TRequest, TResponse>(query);
        }

        public Task<IReadOnlyCollection<DiscoveredService>> DiscoverAsync(ServiceDiscoveryQuery query)
        {
            return _client.DiscoverAsync(query);
        }

        public Task<IReadOnlyCollection<DiscoveredOnlineService>> DiscoverOnlineAsync(ServiceDiscoveryQuery query)
        {
            return _client.DiscoverOnlineAsync(query);
        }

        public void Dispose()
        {
            _client.Dispose();
        }

        public Task ConnectAsync()
        {
            return _client.ConnectAsync();
        }

        public void Disconnect()
        {
            _client.Disconnect();
        }

        public Task DisconnectAsync()
        {
            return _client.DisconnectAsync();
        }
    }
}
