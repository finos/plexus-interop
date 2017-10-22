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
                Log.Debug("Activating app {0}", appId);
                var response = await _client.ActivateAppAsync(appId).ConfigureAwait(false);
                Log.Info("Activated app {0}: {1}", appId, response);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Failed to activate app {0}", appId);
            }
        }

        public async Task ShutdownAsync()
        {
            Log.Info("Shutting down");
            await _client.StopAsync().ConfigureAwait(false);
            Log.Info("Shutdown completed");
        }
    }
}