REM work around for https://github.com/dotnet/cli/issues/3995
set tmp=
set temp=
dotnet restore src\Plexus.Interop.sln && dotnet build -c release src\Plexus.Interop.sln && dotnet pack -c release -o ..\..\..\bin\nuget src\Plexus.Interop.sln /p:CORE_ONLY=true