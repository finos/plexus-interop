REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
if not defined PLEXUS_BUILD_DOTNET_PARAMS (
  set PLEXUS_BUILD_DOTNET_PARAMS=/p:Version=0.3.0-alpha.1
)
CD %~dp0
dotnet build -c release src\Plexus.Interop.sln %PLEXUS_BUILD_DOTNET_PARAMS% && dotnet pack -c release -o ..\..\..\bin\nuget src\Plexus.Interop.sln %PLEXUS_BUILD_DOTNET_PARAMS%