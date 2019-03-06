@ECHO OFF
REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
if not defined PLEXUS_BUILD_NUGET_PUSH_TIMEOUT (
	SET PLEXUS_BUILD_NUGET_PUSH_TIMEOUT=3600
)
dotnet nuget push ..\bin\nuget\*.nupkg -s %PLEXUS_BUILD_NUGET_SOURCE% -k %PLEXUS_BUILD_NUGET_API_KEY% -t %PLEXUS_BUILD_NUGET_PUSH_TIMEOUT% -n