namespace Plexus.Host.Args
{
    using global::CommandLine;

    [Verb("start", HelpText = "Start interop broker.")]
    internal class StartOptions
    {
        [Option('m', "metadata", Required = false, HelpText = "Directory to seek for metadata files: apps.json and interop.json.")]
        public string Metadata { get; set; }
    }

    [Verb("broker", HelpText = "Start interop broker.")]
    internal class BrokerOptions : StartOptions
    {
    }
}
