using System;

namespace Plexus
{
    using Plexus.Logging.NLog;
    using System.IO;
    using System.Reflection;

    public sealed class TestingInitializer : IDisposable
    {
        private readonly LoggingInitializer _logging;

        static TestingInitializer()
        {
            var location = Path.GetDirectoryName(Assembly.GetAssembly(typeof(LoggingInitializer)).Location);
            Environment.SetEnvironmentVariable("PLEXUS_LOG_DIR", $"{location}/logs");
            Directory.SetCurrentDirectory(location);
        }

        public TestingInitializer()
        {
            _logging = new LoggingInitializer();
            LogManager.GetLogger<TestingInitializer>().Info("Initializing tests session");
        }

        public void Dispose()
        {
            LogManager.GetLogger<TestingInitializer>().Info("Disposing tests session");
            _logging.Dispose();
        }
    }
}
