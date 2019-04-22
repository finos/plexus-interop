namespace Plexus.Host.Internal
{
    using CommandLine;
    using CommandLine.Text;

#if NET45
    internal sealed class VerbOptions
    {
        [HelpVerbOption]
        public string DoHelpForVerb(string verbName)
        {
            return HelpText.AutoBuild(this,
                current => HelpText.DefaultParsingErrorsHandler(this, current),
                true);
        }

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
