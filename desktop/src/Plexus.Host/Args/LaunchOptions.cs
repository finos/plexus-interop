namespace Plexus.Host.Args
{
    using System.Collections.Generic;
    using global::CommandLine;

    [Verb("launch", HelpText = "Launch interop application.")]
    internal sealed class LaunchOptions
    {
        [Option('a', "application", Required = true, HelpText = "Identifier of application.", Separator = ',')]
        public IEnumerable<string> ApplicationIds { get; set; }
    }
}
