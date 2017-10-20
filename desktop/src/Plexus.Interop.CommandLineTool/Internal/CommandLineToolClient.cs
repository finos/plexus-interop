namespace Plexus.Interop.CommandLineTool.Internal
{
    using Plexus.Interop.CommandLineTool.Internal.Generated;
    using Plexus.Processes;
    using System.IO;
    using System.Threading.Tasks;

    internal sealed class CommandLineToolClient : ProcessBase
    {
        private static readonly UnaryMethod<ActivateAppRequest, ActivateAppResponse> ActivateAppMethood =
            Method.Unary<ActivateAppRequest, ActivateAppResponse>("interop.AppLifecycleService", "ActivateApp");

        private readonly IClient _client;

        public CommandLineToolClient()
        {
            var options =
                new ClientOptionsBuilder()
                    .WithApplicationId("interop.CommandLineTool")
                    .WithDefaultConfiguration(Directory.GetCurrentDirectory())
                    .Build();
            _client = ClientFactory.Instance.Create(options);
            OnStop(_client.Disconnect);
        }

        protected override ILogger Log { get; } = LogManager.GetLogger<CommandLineToolClient>();

        protected override async Task<Task> StartCoreAsync()
        {
            await _client.ConnectAsync().ConfigureAwait(false);
            return _client.Completion;
        }

        public async Task<ActivateAppResponse> ActivateAppAsync(string appId)
        {
            var response = await _client.Call(ActivateAppMethood, new ActivateAppRequest {AppId = appId});
            return response;
        }
    }
}
