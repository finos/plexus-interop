REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
dotnet nuget push ..\bin\nuget\*.nupkg -s %PLEXUS_BUILD_NUGET_SOURCE% -k %PLEXUS_BUILD_NUGET_API_KEY%