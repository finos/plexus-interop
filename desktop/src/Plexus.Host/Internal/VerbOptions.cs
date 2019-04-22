namespace Plexus.Host.Internal
{
    using CommandLine;

#if NET45
    internal sealed class VerbOptions
    {
        [VerbOption("start", HelpText = "Start interop broker.")]
        public StartCliOptions StartVerb { get; set; }

        [VerbOption("broker", HelpText = "Start interop broker.")]
        public BrokerCliOptions BrokerVerb { get; set; }

        [VerbOption("launch", HelpText = "Launch interop application.")]
        public LaunchCliOptions LaunchCliVerb { get; set; }
 
        [VerbOption("stop", HelpText = "Stop interop broker.")]
        public StopCliOptions StopVerb { get; set; }

        [VerbOption("studio", HelpText = "Start Plexus Studio.")]
        public StudioCliOptions StudioVerb { get; set; }
    }
#endif
}
