namespace Plexus.Interop.Broker.Host
{
    using System.Collections.Generic;
    using System.CommandLine;

    internal sealed class BrokerArguments
    {
        public static BrokerArguments Parse(string[] args)
        {
            var command = BrokerCliCommand.Start;
            var metadataDir = "metadata";
            IReadOnlyList<string> appIds = new string[0];
            ArgumentSyntax.Parse(args, syntax =>
            {
                syntax.ApplicationName = "Plexus.Interop.Broker.Host";
                syntax.ErrorOnUnexpectedArguments = true;
                syntax.HandleHelp = false;
                syntax.HandleErrors = false;
                syntax.HandleResponseFiles = false;

                syntax.DefineCommand("start", ref command, BrokerCliCommand.Start, "Start broker");
                syntax.DefineOption("m|metadata", ref metadataDir, false, "Metadata directory");
                syntax.DefineOptionList("a|application", ref appIds, false, "Application IDs");
            });
            return new BrokerArguments
            {
                Command = command,
                ApplicationIds = appIds,
                MetadataDir = metadataDir
            };
        }

        public BrokerCliCommand Command { get; private set; }

        public IReadOnlyList<string> ApplicationIds { get; private set; }

        public string MetadataDir { get; private set; }
    }
}
