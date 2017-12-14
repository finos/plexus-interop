REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
CD %~dp0
dotnet restore src\Plexus.Interop.sln /p:CORE_ONLY=true && dotnet test src\Plexus.Interop.sln /p:CORE_ONLY=true & exit /b 0