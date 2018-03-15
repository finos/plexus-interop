REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
if defined APPVEYOR (
	SET LOGGER=Appveyor
) else (
	SET LOGGER=xunit
)
if not defined PLEXUS_BUILD_DOTNET_PARAMS (
	SET PLEXUS_BUILD_DOTNET_PARAMS=/p:CORE_ONLY=true
)
dotnet test src\Plexus.Interop.Tests.sln %PLEXUS_BUILD_DOTNET_PARAMS% --test-adapter-path:. --logger:%LOGGER% --verbosity quiet