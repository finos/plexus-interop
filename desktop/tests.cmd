REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
dotnet test src\Plexus.Interop.sln --test-adapter-path:. --logger:xunit;LogFilePath=loggerFile.xml