namespace Plexus.Interop.Apps.Internal
{
    using System;
    using Plexus.Interop.Apps.Internal.Generated;

    internal interface IAppLaunchedEventProvider
    {
        IObservable<AppLaunchedEvent> AppLaunchedStream { get; }
    }
}