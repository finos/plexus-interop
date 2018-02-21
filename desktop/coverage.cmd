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

CALL dotnet restore src\Plexus.Interop.sln && SET PLEXUS_TIMEOUT_MULTIPLIER=10 ^
  && %NUGET_PACKAGES%\OpenCover\4.6.519\tools\OpenCover.Console.exe -oldStyle -returntargetcode -register:user -output:..\bin\test-reports\dotnet-coverage.xml ^
  -filter:"+[Plexus.*]* -[*.Tests]* -[*.IntegrationTests]* -[*.Testing]*" ^
  -targetdir:src -target:dotnet.exe -targetargs:"test Plexus.Interop.Tests.sln /p:DebugType=Full /p:INCREASED_TIMEOUTS=true --test-adapter-path:. --logger:%LOGGER% --verbosity quiet"

CALL %NUGET_PACKAGES%\ReportGenerator\3.1.2\tools\ReportGenerator.exe -reports:..\bin\test-reports\dotnet-coverage.xml -targetdir:..\bin\test-reports\dotnet-coverage -sourcedirs:src reporttypes:Html