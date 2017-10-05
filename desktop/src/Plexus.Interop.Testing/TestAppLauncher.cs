namespace Plexus.Interop.Testing
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Plexus.Interop.Testing.Generated;
    using System.Threading;
    using System.Threading.Tasks;
    using UniqueId = Plexus.UniqueId;

    public sealed class TestAppLauncher : StartableBase
    {
        private readonly Dictionary<string, ClientOptionsBuilder> _clients;

        public TestAppLauncher(IEnumerable<ClientOptionsBuilder> clients = null)
        {
            _clients = clients?.ToDictionary(x => x.ApplicationId, x => x) ?? new Dictionary<string, ClientOptionsBuilder>();
        }
        
        protected override async Task<Task> StartProcessAsync(CancellationToken stopCancellationToken)
        {
            var options = new ClientOptionsBuilder()
                .WithDefaultConfiguration("TestBroker")
                .WithApplicationId("plexus.interop.testing.TestAppLauncher")
                .WithProvidedService(
                    "interop.AppLauncherService", 
                    s => s.WithUnaryMethod<AppLaunchRequest, AppLaunchResponse>("Launch", LaunchAppAsync))
                .Build();
            var client = ClientFactory.Instance.Create(options);
            await client.ConnectAsync().ConfigureAwait(false);
            return client.Completion;
        }

        private async Task<AppLaunchResponse> LaunchAppAsync(AppLaunchRequest request, MethodCallContext context)
        {
            if (!_clients.TryGetValue(request.AppId, out var clientOptions))
            {
                throw new InvalidOperationException($"Unknown application launch requested: {request.AppId}");
            }
            var instanceId = UniqueId.Generate();
            var client = ClientFactory.Instance.Create(clientOptions.WithAppInstanceId(instanceId).Build());
            await client.ConnectAsync().ConfigureAwait(false);
            return new AppLaunchResponse
            {
                AppInstanceId = new Generated.UniqueId
                {
                    Hi = instanceId.Hi,
                    Lo = instanceId.Lo
                }
            };
        }
    }
}
