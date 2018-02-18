REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
dotnet pack -c release -o ..\..\..\bin\nuget src\Plexus.Interop.sln /p:Version=0.1.0-CI00052