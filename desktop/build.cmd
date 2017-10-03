REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
dotnet restore src\Plexus.Interop.sln && dotnet build -c release src\Plexus.Interop.sln