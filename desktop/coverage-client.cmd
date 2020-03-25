REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
if defined APPVEYOR (
	SET LOGGER=Appveyor
) else (
	SET LOGGER=xunit
)

if not defined NUGET_PACKAGES (
	SET NUGET_PACKAGES=%USERPROFILE%\.nuget\packages
)

if not exist ..\bin\test-reports mkdir ..\bin\test-reports

CALL dotnet restore src\Plexus.Interop.sln && dotnet build src\Plexus.Interop.sln -c debug /p:DebugType=Full && SET PLEXUS_TIMEOUT_MULTIPLIER=10 ^
  && %NUGET_PACKAGES%\OpenCover\4.7.922\tools\OpenCover.Console.exe -oldStyle -returntargetcode -register:user -output:..\bin\test-reports\dotnet-coverage.xml ^
  -filter:"+[Plexus.*]* -[*.Tests]* -[*.IntegrationTests]* -[*.Testing]* -[Plexus.Interop.Samples.*]* -[Plexus.*]*.Generated.* -[Plexus.Interop.Broker*]* -[Plexus.Interop.Apps.Manager*]* -[Plexus.Interop.Metamodel*]* -[*.Server]*" -excludebyfile:*.proto.cs;*.g.cs -skipautoprops ^
  -targetdir:src -target:dotnet.exe -searchdirs:..\bin\win-x86\broker -targetargs:"test Plexus.Interop.Tests.sln /p:DebugType=Full --test-adapter-path:. --logger:%LOGGER% --verbosity quiet" ^
  && %NUGET_PACKAGES%\ReportGenerator\4.0.14\tools\net47\ReportGenerator.exe -reports:..\bin\test-reports\dotnet-coverage.xml -targetdir:..\bin\test-reports\dotnet-coverage -sourcedirs:src reporttypes:Html