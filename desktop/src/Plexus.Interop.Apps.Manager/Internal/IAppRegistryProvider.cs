namespace Plexus.Interop.Apps.Internal
{
    using System;

    internal interface IAppRegistryProvider
    {
        AppsDto Current { get; }

        event Action<AppsDto> Updated;
    }
}
