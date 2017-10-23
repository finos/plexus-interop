namespace Plexus.Interop.CommandLineTool
{
    using Plexus.Host;
    using Plexus.Interop.CommandLineTool.Internal;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    public sealed class Program : IProgram
    {
        private static readonly ILogger Log = LogManager.GetLogger<Program>();

        private readonly CommandLineToolClient _client = new CommandLineToolClient();

        public async Task<Task> StartAsync(string[] args)
        {
            var options = CommandLineToolArguments.Parse(args);
            if (options.ApplicationIds.Count == 0)
            {
                return TaskConstants.Completed;
            }
            await _client.StartAsync().ConfigureAwait(false);
            return ProcessAsync(options);
        }

        private async Task ProcessAsync(CommandLineToolArguments options)
        {
            try
            {
                await Task.WhenAll(options.ApplicationIds.Select(ActivateAsync)).ConfigureAwait(false);
            }
            finally
            {
                await _client.StopAsync().ConfigureAwait(false);
            }
        }

        private async Task ActivateAsync(string appId)
        {
            try
            {
                Log.Info("Activating app {0}", appId);
                var response = await _client.ActivateAppAsync(appId).ConfigureAwait(false);
                var connectionId = UniqueId.FromHiLo(response.AppConnectionId.Hi, response.AppConnectionId.Lo);
                var appInstanceId = UniqueId.FromHiLo(response.AppInstanceId.Hi, response.AppInstanceId.Lo);
                Log.Info("Activated app {0}: connectionId={1}, appInstanceId={2}", appId, connectionId, appInstanceId);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Failed to activate app {0}", appId);
            }
        }

        public Task ShutdownAsync()
        {
            return _client.StopAsync();
        }
    }
}