namespace Plexus.Interop.CommandLineTool.Internal
{
    using System.Collections.Generic;
    using System.CommandLine;

    internal sealed class CommandLineToolArguments
    {
        public static CommandLineToolArguments Parse(string[] args)
        {
            var command = CommandLineToolCommand.None;
            IReadOnlyList<string> appIds = new string[0];
            ArgumentSyntax.Parse(args, syntax =>
            {
                syntax.ApplicationName = "Plexus.Interop.CommandLineTool";
                syntax.ErrorOnUnexpectedArguments = true;
                syntax.HandleHelp = false;
                syntax.HandleErrors = false;
                syntax.HandleResponseFiles = false;

                syntax.DefineCommand("activate", ref command, CommandLineToolCommand.ActivateApp, "Activate application(s)");
                syntax.DefineParameterList("application", ref appIds, "Application IDs");
            });
            return new CommandLineToolArguments
            {
                Command = command,
                ApplicationIds = appIds,
            };
        }

        private CommandLineToolArguments()
        {
        }

        public CommandLineToolCommand Command { get; private set; }

        public IReadOnlyList<string> ApplicationIds { get; private set; }
    }
}
