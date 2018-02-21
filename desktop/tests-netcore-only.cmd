REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
if defined APPVEYOR (
	SET LOGGER=Appveyor
) else (
	SET LOGGER=xunit
)
dotnet test src\Plexus.Interop.Tests.sln /p:CORE_ONLY=true --test-adapter-path:. --logger:%LOGGER% --verbosity quiet --no-build --no-restore